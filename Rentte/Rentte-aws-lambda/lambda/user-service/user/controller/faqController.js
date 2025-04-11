const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const logger = require("../../config/winston");
const knex = require("../../db/db");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { GET_ALL_FAQ, GET_ALL_FAQ_CATEGORY, CREATE_CUSTOMER_QUERY
   ,GET_FAQ_DETAILS, GET_FAQ_CATEGORY_BY_ID } = LOGGER_MESSAGES;
module.exports = {
   getAllFaqCategory: async (req, res) => {
      try {
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const totalCountResult = await knex('faqcategories').where({ status: false })
            .count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         const faqCategories = await knex('faqcategories')
            .select('*')
            .limit(limit)
            .where({ status: false })
            .orderBy('created_at', 'desc');
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            faqCategories,
            pagination: { page, limit, totalCount, totalPages },
         }, 1);
         
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_ALL_FAQ_CATEGORY(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   getAllFaq: async (req, res) => {
      try {
         const { faqcategoryid, search } = req.query; // Get search keyword from the body
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const offset = (page - 1) * limit;
   
         // Base query
         const query = knex('faq')
   
         if (search) {
            query.andWhere('questiontype', 'ILIKE', `%${search}%`);
         } else if (faqcategoryid) {
            query.andWhere({ faqcategoryid });
         }
   
         // Get total count with the same conditions
         const totalCountResult = await query.clone().count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
   
         // Get the paginated results
         const faqlist = await query
            .select('*')
            .limit(limit)
            .offset(offset)
            .orderBy('created_at', 'desc');
   
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {
               faqlist,
               pagination: { page, limit, totalCount, totalPages },
            },
            1,
         );
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_ALL_FAQ(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(
            constant.MESSAGE.INTERNAL_ERROR,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0,
         );
      }
   },
   createCustomerQuery: async (req, res) => {
      try {
         const { id } = req.user
         const { querytype, message } = req.body;
         if (!querytype && !message) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS
               .replace('{{key}}', 'querytype, message'),
            res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const findUser = await knex("users").where({ id })
            .first(); 
         if (!findUser) {
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'user'),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         await knex("customerqueries").insert({ 
            message, 
            userid: id,
            email: findUser.email,
            querytype, 
            name: findUser.firstName,
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);

      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: CREATE_CUSTOMER_QUERY(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   getFaqDetails: async (req,res) => {
      try {
         const { id } = req.query;   
         if (!id) {
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq id'),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const faq = await knex("faq").where({ id })
            .first();
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            faqDetails: faq,
         }, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_FAQ_DETAILS(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   getFaqByCategory: async (req,res) => {
      try {
         const { faqcategoryid } = req.query;   
         if (!faqcategoryid) {
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq id'),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const faq = await knex("faq").where({ faqcategoryid })
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            faqList: faq,
         }, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_FAQ_CATEGORY_BY_ID(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
}
