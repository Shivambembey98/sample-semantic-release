const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const logger = require("../../config/winston");
const knex = require("../../db/db");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { LIST_ALL_PARTNER, DASHBOARD_PARTNER } = LOGGER_MESSAGES;
module.exports = {
   listAllPartner: async (req, res) => {
      try {
         logger.info("Partner login",{
            ...commonLogger(),
            operation: LIST_ALL_PARTNER().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { search } = req.query || null;
         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit) || 10;
         const offset = (page - 1) * limit;
    
         // Start building the query
         const partnerQuery = knex('users')
            .select('users.*') // Select columns from both tables
            .where('users.userType', 'partner') // Ensure that we're only querying partners
            .limit(limit)
            .orderBy('users.created_at', 'desc')
            .offset(offset);
    
         // Apply search filter if search is provided
         if (search) {
            partnerQuery.andWhere(function () {
               this.whereRaw('CAST("mobileNumber" AS TEXT) ILIKE ?', [`%${search}%`])
                  .orWhereRaw('CAST("email" AS TEXT) ILIKE ?', [`%${search}%`])
                  .orWhereRaw('CAST("firstName" AS TEXT) ILIKE ?', [`%${search}%`])
                  .orWhereRaw('CAST("lastName" AS TEXT) ILIKE ?', [`%${search}%`]);
            });
         }
    
         const partners = await partnerQuery;
    
         // Count total partners for pagination
         const totalCountResult = await knex('users')
            .where({ userType: 'partner' })
            .count('users.id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         logger.info("Listed successfully",{
            ...commonLogger(),
            operation: LIST_ALL_PARTNER().OPERATION,
            context: LIST_ALL_PARTNER(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            partners,
            pagination: { page, limit, totalCount, totalPages },
         }, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: LIST_ALL_PARTNER().OPERATION,
            context: LIST_ALL_PARTNER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   dashboardPartner: async (req,res) => {
      try {
         const { id } = req.user
         const findTotalProducts = await knex('products').where({ userid: id,isdelete: null })
            .count('id as count')
            .first()
         const findProductOnRent = await knex('products').
            where({ userid: id, isRented: true,isdelete: null })
            .count('id as count')
            .first()
         return sendResponse(constant.MESSAGE.SUCCESS,res,constant.CODE.SUCCESS,{
            totalActiveProduct: findTotalProducts.count,
            totalProductOnRent: findProductOnRent.count,
         },1)
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: DASHBOARD_PARTNER().OPERATION,
            context: DASHBOARD_PARTNER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, res, 
            constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
};
