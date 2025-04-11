const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const knex = require("../../db/db");
const logger = require("../../config/winston");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { CREATE_FAQ_CATEGORY, EDIT_FAQ_CATEGORY,DELETE_FAQ_CATEGORY, CREATE_FAQ,
   GET_ALL_CUSTOMER_QUERY, DELETE_FAQ } = LOGGER_MESSAGES
module.exports = {
   createFaqCategory: async (req, res) => {
      try {
         const { name,description } = req.body;
         if (!name) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS
               .replace("{{key}}", "category name"), 
            res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!req.file.key) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'icon image'), 
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!description) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'description'), 
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         await knex("faqcategories").insert({ name, icon: req.file.key, description  });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: CREATE_FAQ_CATEGORY(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message,res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   editFaqCategory: async (req, res) => {
      try {
         const { name,description,id } = req.body;
         const iconurl = req.file ? req.file.key : undefined;
         if (!req.file.key) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'icon image'),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!id) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'category id'),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }

         const category = await knex("faqcategories").where({ id })
            .first();
         
         if (!category) {
            return sendResponse(constant.MESSAGE.NOT_FOUND
               .replace('{{key}}', 'faq category not found'),
            res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const updateData = {};
         if (name) {
            updateData.name = name;
         }
         if (iconurl) {
            updateData.icon = iconurl
         }
         if (description) {
            updateData.description = description
         }

         await knex("faqcategories").update(updateData)
            .where({ id });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: EDIT_FAQ_CATEGORY(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   deleteFaqCategory: async (req, res) => {
      try {
         const { id } = req.body;
         if (!id) {
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'category id'),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const category = await knex("faqcategories").where({ id })
            .first();

         if (!category) {
            return sendResponse(constant.MESSAGE.NOT_FOUND
               .replace('{{key}}', 'faq category not found'),
            res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         await knex("faqcategories").where({ id })
            .update({ status: true })
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: DELETE_FAQ_CATEGORY(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   createFaq: async (req,res) => {
      try {
         const { faqcategoryid,questiontype,questionanswer } = req.body;
         if (!faqcategoryid) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS
               .replace('{{key}}', 'faq category id'),
            res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!questiontype) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS
               .replace('{{key}}', 'questiontype'),
            res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (!questionanswer) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS
               .replace('{{key}}', 'questionanswer'),
            res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const category = await knex("faqcategories").where({ id: faqcategoryid })
            .first();
         if (!category) {
            return sendResponse(constant.MESSAGE.NOT_FOUND
               .replace('{{key}}', 'faq category not found'),
            res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         await knex("faq").insert({ 
            faqcategoryid, 
            questiontype,
            categorytype: category.name,
            questionanswer: JSON.stringify(questionanswer) });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);

      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: CREATE_FAQ(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message,res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   editFaq: async (req, res) => {
      try {
         const { faqid, questiontype, questionanswer } = req.body;
  
         if (!faqid) {
            return sendResponse(
               constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq id'),
               res,
               constant.CODE.BAD_REQUEST,
               {},
               0,
            );
         }
  
         const faq = await knex('faq').where({ id: faqid })
            .first();
  
         if (!faq) {
            return sendResponse(
               constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq not found'),
               res,
               constant.CODE.BAD_REQUEST,
               {},
               0,
            );
         }
  
         const updateData = {};
         if (questiontype !== undefined) {updateData.questiontype = questiontype;}
         if (questionanswer !== undefined) {updateData.questionanswer = questionanswer;}
  
         await knex('faq').where({ id: faqid })
            .update(updateData);
  
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1,
         );
  
      } catch (error) {
         return sendResponse(
            error.message || 'Unexpected Error',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0,
         );
      }
   },
   deleteFaq: async (req, res) => {
      try {
         const { id } = req.query;
         if (!id) {
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq id'),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const faq = await knex("faq").where({ id })
            .first();

         if (!faq) {
            return sendResponse(constant.MESSAGE.NOT_FOUND
               .replace('{{key}}', 'faq not found'),
            res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         await knex("faq").where({ id })
            .update({ status: false })
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: DELETE_FAQ(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   getAllCustomerQuery: async (req, res) => {
      try {
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const offset = (page - 1) * limit;
         const totalCountResult = await knex('customerqueries')
            .count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         const customerQueries = await knex('customerqueries')
            .select('*')
            .limit(limit)
            .offset(offset)
            .orderBy('created_at', 'desc');
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            customerQueries,
            pagination: { page, limit, totalCount, totalPages },
         }, 1);

      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_ALL_CUSTOMER_QUERY(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
