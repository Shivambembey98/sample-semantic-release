const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const logger = require("../../config/winston");
const knex = require("../../db/db");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { inputValidation } = require("../../validators/productValidator");
const { CREATE_RATING, RATING_LIST, EDIT_RATING, DELETE_RATING } =
   LOGGER_MESSAGES;
module.exports = {
   createRating: async (req, res) => {
      try {
         logger.info("create rating", {
            ...commonLogger(),
            operation: CREATE_RATING().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const ratingData = {
            ...req.body,
            userId: req.user.id,
         };
         const { productId } = req.body;
         const requestValidation = await inputValidation(
            ratingData,
            "ratingValidation",
         );
         if (requestValidation) {
            logger.error("Exception error", {
               ...commonLogger(),
               operation: CREATE_RATING().OPERATION,
               error: "Validation error",
               context: CREATE_RATING(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(
               requestValidation,
               res,
               constant.CODE.INPUT_VALIDATION,
               {},
               0,
            );
         }
         const rating = await knex("rating")
            .where({ userId: req.user.id, productId })
            .first();
         if (rating) {
            logger.error("Exception error", {
               ...commonLogger(),
               operation: CREATE_RATING().OPERATION,
               error: "Rating already exists",
               context: CREATE_RATING(constant.MESSAGE.ALREADY_EXIST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(
               constant.MESSAGE.ALREADY_EXIST.replace("{{key}}", "rating"),
               res,
               constant.CODE.ALREADY_EXIST,
               {},
               0,
            );
         }
         const [id] = await knex("rating").insert(ratingData)
            .returning("id");
         logger.info("Rating Created", {
            ...commonLogger(),
            operation: CREATE_RATING().OPERATION,
            context: CREATE_RATING(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { id },
            1,
         );
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: CREATE_RATING().OPERATION,
            context: CREATE_RATING(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(
            error.message,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0,
         );
      }
   },
   ratingList: async (req, res) => {
      try {
         logger.info("Rating list", {
            ...commonLogger(),
            operation: RATING_LIST().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productId,userId } = req.query
         if (!productId) {
            return sendResponse("Product id is required",res,constant.CODE.INPUT_VALIDATION,{},0)
         }
         let findRatingByUserId
         if (userId) {
            findRatingByUserId = await knex('rating').where({
               productId, userId, isdelete: false })
               .first("*")
         }
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const offset = (page - 1) * limit;
         const rating = await knex("rating")
            .select(
               "rating.id",
               "rating.comments",
               "rating.rating",
               "rating.productId",
               "rating.userId",
               "rating.created_at",
               "rating.updated_at",
               knex.raw(`
                 json_build_object(
                     'id', users.id,
                     'firstName', "users"."firstName",
                     'lastName', "users"."lastName",
                     'email', "users"."email",
                     'profileImage', "users"."profileimage"
                 ) as user
               `),
            )
            .leftJoin('users', 'rating.userId', 'users.id')
            .where("rating.isdelete", false)
            .where("rating.productId", productId)
            .limit(limit)
            .orderBy("rating.created_at", "desc")
            .offset(offset);
     
         const totalCountResult = await knex("rating").count("id as count");
         const totalCount = totalCountResult && totalCountResult[0] ? totalCountResult[0].count : 0;
         const totalPages = Math.ceil(totalCount / limit);
         logger.info("Rating list", {
            ...commonLogger(),
            operation: RATING_LIST().OPERATION,
            context: RATING_LIST(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { rating, 
               pagination: { page, limit, totalCount, totalPages },
               isRated: findRatingByUserId ? true : false },
            1,
         );
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: RATING_LIST().OPERATION,
            context: RATING_LIST(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR,
            res, constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   editRating: async (req, res) => {
      try {
         logger.info("Edit Rating", {
            ...commonLogger(),
            operation: EDIT_RATING().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { ratingId } = req.query;

         if (!ratingId) {
            try {
               logger.error("Validation error: Missing ratingId", {
                  ...commonLogger(),
                  operation: EDIT_RATING().OPERATION,
                  context: EDIT_RATING(constant.CODE.INPUT_VALIDATION).CONTEXT,
                  client: {
                     ip: req.ip,
                     headers: req.headers,
                     requestBody: req.body,
                  },
               });
            } catch (loggingError) {
               console.error("Logging error:", loggingError);
            }
            return sendResponse(
               "Validation error",
               res,
               constant.CODE.INPUT_VALIDATION,
               {},
               0,
            );
         }
         const requestValidation = await inputValidation(
            req.body,
            "ratingValidation",
         );
         if (requestValidation) {
            try {
               logger.error("Exception error", {
                  ...commonLogger(),
                  operation: EDIT_RATING().OPERATION,
                  error: "Validation error",
                  context: EDIT_RATING(constant.CODE.INPUT_VALIDATION).CONTEXT,
                  client: {
                     ip: req.ip,
                     headers: req.headers,
                     requestBody: req.body,
                  },
               });
            } catch (loggingError) {
               console.error("Logging error:", loggingError);
            }
            return sendResponse(
               requestValidation,
               res,
               constant.CODE.INPUT_VALIDATION,
               {},
               0,
            );
         }
         const rowsAffected = await knex("rating")
            .where({ id: ratingId })
            .update(req.body);

         if (!rowsAffected) {
            try {
               logger.error("No rows affected", {
                  ...commonLogger(),
                  operation: EDIT_RATING().OPERATION,
                  context: EDIT_RATING(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
                  client: {
                     ip: req.ip,
                     requestBody: req.body,
                  },
               });
            } catch (loggingError) {
               console.error("Logging error:", loggingError);
            }
            return sendResponse(
               "No rows affected",
               res,
               constant.CODE.INTERNAL_SERVER_ERROR,
               {},
               0,
            );
         }
         // await knex("rating").where({ id: ratingId }).update(req.body);
         logger.info("Rating edited", {
            ...commonLogger(),
            operation: EDIT_RATING().OPERATION,
            context: EDIT_RATING(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1,
         );
      } catch (error) {
         try {
            logger.error("Exception error", {
               ...commonLogger(),
               error: error.message,
               stack: error.stack,
               operation: EDIT_RATING().OPERATION,
               context: EDIT_RATING(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
         } catch (loggingError) {
            console.error("Logging error:", loggingError);
         }
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },

   deleteRating: async (req, res) => {
      try {
         logger.info("Delete Rating", {
            ...commonLogger(),
            operation: DELETE_RATING().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { ratingId } = req.query;
         if (!ratingId) {
            logger.error("Exception error", {
               ...commonLogger(),
               operation: DELETE_RATING().OPERATION,
               error: "Validation error",
               context: DELETE_RATING(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(
               "rating id is not found",
               res,
               constant.CODE.INPUT_VALIDATION,
               {},
               0,
            );
         }
         const rating = await knex("rating").where({ id: ratingId })
            .first();
         if (!rating) {
            logger.error("Exception error", {
               ...commonLogger(),
               operation: DELETE_RATING().OPERATION,
               error: "Rating not exist",
               context: DELETE_RATING(constant.MESSAGE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(
               constant.MESSAGE.NOT_FOUND.replace("{{key}}", "rating"),
               res,
               constant.CODE.NOT_FOUND,
               {},
               0,
            );
         }
         await knex("rating").where({ id: ratingId })
            .update({ isdelete: true });
         logger.info("Rating deleted", {
            ...commonLogger(),
            operation: DELETE_RATING().OPERATION,
            context: DELETE_RATING(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1,
         );
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: DELETE_RATING().OPERATION,
            context: DELETE_RATING(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR,
            res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
};
