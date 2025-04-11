const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const logger = require("../../config/winston");
const knex = require("../../db/db");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { inputValidation } = require("../../validators/productValidator");
const { GET_CATEGORY_LIST,GET_SUBCATEGORY_LIST,
   CREATE_HISTORY_PARTNER,GET_HISTORY_PARTNER } = LOGGER_MESSAGES;

module.exports = {
   getCategoryList: async (req,res) => {
      try {
         logger.info("Category list",{
            ...commonLogger(),
            operation: GET_CATEGORY_LIST().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });

         const categories = await knex('category')
            .select(
               'category.id as categoryId',
               'category.categoryName',
               'category.description as categoryDescription',
               'category.created_at as categoryCreatedAt',
               'category.updated_at as categoryUpdatedAt',
               knex.raw(`
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', subcategory.id,
                                'subCategoryName', subcategory."subCategoryName",
                                'created_at', subcategory.created_at,
                                'updated_at', subcategory.updated_at,
                                'description', subcategory.description,
                                'subcategoryimage', subcategory.subcategoryimage
                            )
                        ) FILTER (WHERE subcategory.id IS NOT NULL), '[]'
                    ) as subcategories
                `),
            )
            .rightJoin('subcategory', 'subcategory.categoryId', 'category.id')
            .where('category.isDelete', false)
            .andWhere('subcategory.isDelete', false)
            .groupBy('category.id')
            .orderBy('category.created_at', 'desc');
        
         return sendResponse(constant.MESSAGE.SUCCESS,
            res,constant.CODE.SUCCESS,
            { categories },1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: GET_CATEGORY_LIST().OPERATION,
            context: GET_CATEGORY_LIST(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   subCategoryList: async (req, res) => {
      try {
         if (!req.query.categoryId) {
            return sendResponse('Category id not found', 
               res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const offset = (page - 1) * limit;
         const { categoryId } = req.query;
         const subcategories = await knex('subcategory')
            .select(
               'subcategory.id', 
               'subcategory.subCategoryName', 
               'subcategory.created_at', 
               'subcategory.updated_at',
               'subcategory.description', 
               'subcategory.subcategoryimage',
               knex.raw(`
                        json_build_object(
                            'id', "category"."id",
                            'categoryName', "category"."categoryName",
                            'created_at', "category"."created_at",
                            'updated_at', "category"."updated_at"
                        ) as category
                    `),
            )
            .leftJoin('category', 'subcategory.categoryId', 'category.id')
            .where('subcategory.isDelete', false)
            .andWhere('subcategory.categoryId', categoryId)
            .limit(limit)
            .orderBy('subcategory.created_at', 'desc')
            .offset(offset);
         const totalCountResult = await knex('subcategory').count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            subcategories,
            pagination: { page, limit, totalCount, totalPages },
         }, 1);
    
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: GET_SUBCATEGORY_LIST().OPERATION,
            context: GET_SUBCATEGORY_LIST(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   createHistoryPartner: async (req, res) => {
      try {
         const { id } = req.user;
         const requestData = { ...req.body, userid: id };
         const requestValidation = await inputValidation(requestData, "createHistory");
         if (requestValidation) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: requestValidation,
               operation: CREATE_HISTORY_PARTNER().OPERATION,
               context: CREATE_HISTORY_PARTNER(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const createHistoryPartner = await knex('partnerRentalHistory').insert(requestData)
            .returning('id');
         if (createHistoryPartner.length > 0) {
            return sendResponse(constant.MESSAGE.CREATE_HISTORY, res, constant.CODE.SUCCESS, {}, 1);
         }
         return sendResponse(constant.MESSAGE.BAD_REQUEST, res, constant.CODE.BAD_REQUEST, {}, 0);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: CREATE_HISTORY_PARTNER().OPERATION,
            context: CREATE_HISTORY_PARTNER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   }
   ,
   deleteHistoryPartner: async (req,res) => {
      try {
         const { historyid } = req.body
         const requestValidation = await inputValidation(req.body, "deleteHistory")
         if (requestValidation) {
            return sendResponse(requestValidation,res,constant.CODE.INPUT_VALIDATION,{},0)
         }
         const deleteHistory = await knex('partnerRentalHistory').where({ id: historyid })
            .update({ status: true })
         if (deleteHistory === 1) {
            return sendResponse(constant.MESSAGE.SUCCESS,res,constant.CODE.SUCCESS,{},1)
         }
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0)
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
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
   partnerHistoryList: async (req, res) => {
      try {
         const { id } = req.user;
         const { page = 1, limit = 10 } = req.query;
         const offset = (page - 1) * limit;
         if (!id) {
            return sendResponse('User ID is required', 
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const partnerRentalHistory = await knex('partnerRentalHistory')
            .select(
               'partnerRentalHistory.*',
               knex.raw(`
              JSON_BUILD_OBJECT(
                'description', products.description,
                'categoryId', "products"."categoryId",
                'location', products.location,
                'productImages', "products"."productImages",
                'subCategoryId', "products"."subCategoryId",
                'searchCount', products.searchcount,
                'viewCount', products.viewcount,
                'clickCount', products.clickcount,
                'unitprice', products.unitprice,
                'rentaltype',"products"."rentalType",
                'productname', products.productname,
                'rentalperiod', products.rentalperiod,
                'quantity', products.quantity
              ) as product
            `),
            )
            .leftJoin('products', 'partnerRentalHistory.productid', 'products.id')
            .where('partnerRentalHistory.userid', id)
            .limit(limit)
            .offset(offset);
    
         const totalRecords = await knex('partnerRentalHistory')
            .count('id as count')
            .where('userid', id)
            .first();
    
         const totalPages = Math.ceil(totalRecords.count / limit);
    
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {
               partnerRentalHistory,
               totalRecords: totalRecords.count,
               totalPages,
               currentPage: page,
            },
            1,
         );
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_HISTORY_PARTNER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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

   createHistoryUser: async (req,res) => {
      try {
         const { id } = req.user
         const requestData = { ...req.body, userid: id };
         const requestValidation = await inputValidation(req.body, "createHistory")
         if (requestValidation) {
            return sendResponse(requestValidation,res,constant.CODE.INPUT_VALIDATION,{},0)
         }
         const createHistoryUser = await knex('userRentalHistory').insert(requestData)
            .returning('id');

         if (createHistoryUser.length > 0) {
            return sendResponse(constant.MESSAGE.CREATE_HISTORY,res,constant.CODE.SUCCESS,{},1)
         }
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0)
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
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
   deleteHistoryUser: async (req,res) => {
      try {
         const { historyid } = req.body
         const requestValidation = await inputValidation(req.body, "deleteHistory")
         if (requestValidation) {
            return sendResponse(requestValidation,res,constant.CODE.INPUT_VALIDATION,{},0)
         }
         const deleteHistory = await knex('userRentalHistory').where({ id: historyid })
            .update({ status: true })
         if (deleteHistory === 1) {
            return sendResponse(constant.MESSAGE.SUCCESS,res,constant.CODE.SUCCESS,{},1)
         }
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0)
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
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
   userHistoryList: async (req, res) => {
      try {
         const { id } = req.user;
         const { page = 1, limit = 10 } = req.query; // Default page is 1, and limit is 10 per page
         if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
            return sendResponse(
               'Invalid query parameters',
               res,
               constant.CODE.INPUT_VALIDATION,
               {},
               0,
            );
         }
         const offset = (page - 1) * limit;
    
         const partnerRentalHistory = await knex('userRentalHistory')
            .select(
               'partnerRentalHistory.*',
               knex.raw(`
              JSON_BUILD_OBJECT(
                'description', products.description,
                'categoryId', "products"."categoryId",
                'availabilityStatus', "products"."availabilityStatus",
                'location', products.location,
                'productImages', "products"."productImages",
                'subCategoryId', "products"."subCategoryId",
                'searchCount', products.searchcount,
                'viewCount', products.viewcount,
                'clickCount', products.clickcount
              ) as product
            `),
            )
            .leftJoin('products', 'partnerRentalHistory.productid', 'products.id')
            .where('partnerRentalHistory.userid', id)
            .limit(limit)
            .offset(offset);
    
         const totalRecords = await knex('partnerRentalHistory')
            .count('id as count')
            .where('userid', id)
            .first();
         const totalPages = Math.ceil(totalRecords.count / limit);
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {
               partnerRentalHistory,
               totalRecords: totalRecords.count,
               totalPages,
               currentPage: page,
            },
            1,
         );
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
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
};
