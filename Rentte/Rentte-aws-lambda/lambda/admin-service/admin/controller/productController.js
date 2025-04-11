const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const logger = require("../../config/winston");
const knex = require("../../db/db");
const sharp = require("sharp");
const axios = require("axios");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const watermarkPath = 'watermark/watermark.png'
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { productValidator } = require("../../validators/productValidator");
const { s3Client } = require("../../utils/s3Client");
const { ADD_CATEGORY, CATEGORY_LIST, UPDATE_CATEGORY, DELETE_CATEGORY,
   ADD_SUBCATEGORY, DELETE_SUBCATEGORY, UPDATE_SUBCATEGORY,
   SUBCATEGORY_LIST, BLOCK_AND_UNBLOCK_PRODUCT, POST_BANNER,
   UPDATE_BANNER, DELETE_BANNER, IMAGE_VALIDATION } = LOGGER_MESSAGES;
module.exports = {
   addCategory: async (req, res) => {
      try {
         logger.info("Request to add category", {
            ...commonLogger(),
            operation: ADD_CATEGORY().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const categoryData = { ...req.body, categoryName: req.body.categoryName.toLowerCase() };
         const { categoryName } = categoryData;
         const requestValidation = await productValidator(categoryData, "category");
         if (requestValidation) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Validation Errors",
               operation: ADD_CATEGORY().OPERATION,
               context: ADD_CATEGORY(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const categoroy = await knex("category").where({ categoryName, isDelete: false })
            .first();
         if (categoroy) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Category exists",
               operation: ADD_CATEGORY().OPERATION,
               context: ADD_CATEGORY(constant.CODE.ALREADY_EXIST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.ALREADY_EXIST.replace("{{key}}", "category"),
               res, constant.CODE.ALREADY_EXIST, {}, 0);
         }
         const [id] = await knex("category").insert(categoryData)
            .returning("id");
         logger.info("Category listed", {
            ...commonLogger(),
            operation: ADD_CATEGORY().OPERATION,
            context: ADD_CATEGORY(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, { id }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: ADD_CATEGORY().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   categoryList: async (req, res) => {
      try {
         const { isSubCategoryRequest } = req.query;
         logger.info("Request to list category", {
            ...commonLogger(),
            operation: CATEGORY_LIST().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const offset = (page - 1) * limit;
         let query = knex('category')
            .select('id', 'categoryName', 'description', 'created_at', 'updated_at')
            .where('isDelete', false)
            .orderBy('created_at', 'desc');

         if (!isSubCategoryRequest) {
            query = query.limit(limit).offset(offset);
         }
         const categories = await query;
         const totalCountResult = await knex('category')
            .where('isDelete', false)
            .count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         logger.info("Category listed", {
            ...commonLogger(),
            operation: CATEGORY_LIST().OPERATION,
            context: CATEGORY_LIST(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS,
            res, constant.CODE.SUCCESS,
            { categories, pagination: { page, limit, totalCount, totalPages } }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: CATEGORY_LIST().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   updateCategory: async (req, res) => {
      try {
         logger.info("Request to update category", {
            ...commonLogger(),
            operation: UPDATE_CATEGORY().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { id, categoryName, description, isDelete = false } = req.body;
         const requestValidation = await productValidator(req.body, "updateCategory");
         if (requestValidation) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Validation Error",
               operation: UPDATE_CATEGORY().OPERATION,
               context: UPDATE_CATEGORY(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const category = await knex('category').where({ id })
            .first();
         if (!category) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Category not found",
               operation: UPDATE_CATEGORY().OPERATION,
               context: UPDATE_CATEGORY(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "category"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         await knex('category').where({ id })
            .update({ categoryName, description, isDelete });
         logger.info("Category listed", {
            ...commonLogger(),
            operation: UPDATE_CATEGORY().OPERATION,
            context: UPDATE_CATEGORY(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: UPDATE_CATEGORY().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   deleteCategory: async (req, res) => {
      try {
         logger.info("Request to delete category", {
            ...commonLogger(),
            operation: DELETE_CATEGORY().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { id } = req.body;
         const requestValidation = await productValidator(req.body, "idIsRequired");
         if (requestValidation) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Validation Error",
               operation: DELETE_CATEGORY().OPERATION,
               context: DELETE_CATEGORY(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const category = await knex('category').where({ id })
            .first();
         if (!category) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Category not found",
               operation: DELETE_CATEGORY().OPERATION,
               context: DELETE_CATEGORY(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "category"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         await knex('category').where({ id })
            .update({ isDelete: true });
         logger.info("Category Deleted", {
            ...commonLogger(),
            operation: DELETE_CATEGORY().OPERATION,
            context: DELETE_CATEGORY(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: DELETE_CATEGORY().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   addSubCategory: async (req, res) => {
      try {
         logger.info("Request to add subcategory", {
            ...commonLogger(),
            operation: ADD_SUBCATEGORY().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const newSubCategoryData = {
            ...req.body,
            subCategoryName: req.body.subCategoryName.toLowerCase(),
            subcategoryimage: req.file.key,
         };
         const { subCategoryName } = newSubCategoryData;
         const requestValidation = await productValidator(newSubCategoryData, "subCategory");
         if (requestValidation) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Validation Error",
               operation: ADD_SUBCATEGORY().OPERATION,
               context: ADD_SUBCATEGORY(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const subcategory = await knex("subcategory").where({ subCategoryName, isDelete: false })
            .first();
         if (subcategory) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Subcategory already exists",
               operation: ADD_SUBCATEGORY().OPERATION,
               context: ADD_SUBCATEGORY(constant.CODE.ALREADY_EXIST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.ALREADY_EXIST.replace("{{key}}", "subcategory"),
               res, constant.CODE.ALREADY_EXIST, {}, 0);
         }

         const category = await knex("category")
            .where({ categoryName: subCategoryName, isDelete: false })
            .first();
         if (category) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Sub category can not be same as Category name",
               operation: ADD_SUBCATEGORY().OPERATION,
               context: ADD_SUBCATEGORY(constant.CODE.ALREADY_EXIST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.SUBCATEGORY_INVALID,
               res, constant.CODE.ALREADY_EXIST, {}, 0);
         }
         const [id] = await knex('subcategory').insert(newSubCategoryData)
            .returning('id');
         logger.info("Subcategory Added", {
            ...commonLogger(),
            operation: ADD_SUBCATEGORY().OPERATION,
            context: ADD_SUBCATEGORY(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, { id }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: ADD_SUBCATEGORY().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   updateSubCategory: async (req, res) => {
      try {
         logger.info("Request to update subcategory", {
            ...commonLogger(),
            operation: UPDATE_SUBCATEGORY().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const requestValidation = await productValidator(req.body, "updateSubCategory");
         if (requestValidation) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Validation Error",
               operation: UPDATE_SUBCATEGORY().OPERATION,
               context: UPDATE_SUBCATEGORY(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const { id } = req.body;
         const updatedData = { ...req.body }
         if (req.file && req.file.key) {
            updatedData.subcategoryimage = req.file.key; // Use updatedData instead of req.body
         }
         const category = await knex('subcategory').where({ id })
            .first();
         if (!category) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Subcategory not found",
               operation: UPDATE_SUBCATEGORY().OPERATION,
               context: UPDATE_SUBCATEGORY(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "subcategory"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         await knex('subcategory').where({ id })
            .update(updatedData);
         logger.info("Subcategory updated", {
            ...commonLogger(),
            operation: UPDATE_SUBCATEGORY().OPERATION,
            context: UPDATE_SUBCATEGORY(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: UPDATE_SUBCATEGORY().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   subCategoryList: async (req, res) => {
      try {
         logger.info("Request to list subcategory", {
            ...commonLogger(),
            operation: SUBCATEGORY_LIST().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const offset = (page - 1) * limit;
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
            .limit(limit)
            .orderBy('subcategory.created_at', 'desc')
            .offset(offset);

         const totalCountResult = await knex('subcategory')
            .where('isDelete', false)
            .count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         logger.info("Subcategory updated", {
            ...commonLogger(),
            operation: SUBCATEGORY_LIST().OPERATION,
            context: SUBCATEGORY_LIST(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            subcategories,
            pagination: { page, limit, totalCount, totalPages },
         }, 1);

      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: SUBCATEGORY_LIST().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   deleteSubCategory: async (req, res) => {
      try {
         logger.info("Request to delete subcategory", {
            ...commonLogger(),
            operation: DELETE_SUBCATEGORY().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { id } = req.body;
         const requestValidation = await productValidator(req.body, "idIsRequired");
         if (requestValidation) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Validation Error",
               operation: DELETE_SUBCATEGORY().OPERATION,
               context: DELETE_SUBCATEGORY(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const subcategory = await knex('subcategory').where({ id })
            .first();
         if (!subcategory) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Subcategory not found",
               operation: DELETE_SUBCATEGORY().OPERATION,
               context: DELETE_SUBCATEGORY(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "subcategory"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         await knex('subcategory').where({ id })
            .update({ isDelete: true });
         logger.info("Subcategory Deleted", {
            ...commonLogger(),
            operation: DELETE_SUBCATEGORY().OPERATION,
            context: DELETE_SUBCATEGORY(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: DELETE_SUBCATEGORY().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   blockAndUnblockProduct: async (req, res) => {
      try {
         logger.info("Request to block and unblock product", {
            ...commonLogger(),
            operation: BLOCK_AND_UNBLOCK_PRODUCT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productId, isBlock } = req.body;
         const product = await knex("products").where({ id: productId })
            .first();
         if (!product) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Product not found",
               operation: BLOCK_AND_UNBLOCK_PRODUCT().OPERATION,
               context: BLOCK_AND_UNBLOCK_PRODUCT(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(
               constant.MESSAGE.NOT_FOUND.replace("{{key}}", "productId"),
               res,
               constant.CODE.NOT_FOUND,
               {},
               0,
            );
         }

         await knex("products").where({ id: productId })
            .update({ status: isBlock });
         logger.info(`User ${isBlock === true} ? "Block": "Unblock"`, {
            ...commonLogger(),
            operation: BLOCK_AND_UNBLOCK_PRODUCT().OPERATION,
            context: BLOCK_AND_UNBLOCK_PRODUCT(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: BLOCK_AND_UNBLOCK_PRODUCT().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   getAllProducts: async (req, res) => {
      try {

         logger.info("Get All Products", {
            ...commonLogger(),
            operation: "GET_ALL_PRODUCTS",
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });

         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 10;
         const offset = (page - 1) * limit;

         // Query to fetch products with their category and subcategory details
         const products = await knex('products')
            .select(
               'products.id as id',
               'products.productname',
               'products.brandname',
               'products.description',
               'products.productImages',
               'products.amount',
               'products.unitprice',
               'products.rentalType',
               'products.rentalperiod',
               'products.quantity',
               'products.price',
               'products.isProductImageVerify',
               'products.created_at',
               knex.raw(`
                        json_build_object(
                            'id', "category"."id",
                            'name', "category"."categoryName",
                            'description', "category"."description"
                        ) as category
                    `),
               knex.raw(`
                        json_build_object(
                            'id', "subcategory"."id",
                            'name', "subcategory"."subCategoryName",
                            'description', "subcategory"."description"
                        ) as subcategory
                    `),
            )
            .leftJoin('category', 'products.categoryId', 'category.id')
            .leftJoin('subcategory', 'products.subCategoryId', 'subcategory.id')
            .where('products.isdelete', null)
            .limit(limit)
            .offset(offset);
         // Count total products for pagination
         const totalCountResult = await knex('products')
            .where('isdelete', null)
            .count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);

         logger.info("All Products Retrieved", {
            ...commonLogger(),
            operation: "GET_ALL_PRODUCTS",
            context: constant.CODE.SUCCESS,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });

         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { products, pagination: { page, limit, totalCount, totalPages } },
            1,
         );
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: "GET_ALL_PRODUCTS",
            context: constant.CODE.INTERNAL_SERVER_ERROR,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   postBanner: async (req, res) => {
      try {
         logger.info("Request to post Banner", {
            ...commonLogger(),
            operation: POST_BANNER().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const bannerUpload = {
            ...req.body,
            bannerimage: req.file.key,
         }
         const requestValidation = await productValidator(req.body, "bannerUpload");
         if (requestValidation) {
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const [id] = await knex('banner').insert(bannerUpload)
            .returning('id'); ;
         logger.info("Banner Posted", {
            ...commonLogger(),
            operation: POST_BANNER().OPERATION,
            context: POST_BANNER(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, { id }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: POST_BANNER().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   updateBanner: async (req, res) => {
      try {
         logger.info("Request to update Banner", {
            ...commonLogger(),
            operation: UPDATE_BANNER().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });

         const requestValidation = await productValidator(req.body, "bannerUpload");
         if (requestValidation) {
            logger.error("Validation Error", {
               ...commonLogger(),
               error: "Validation Error",
               operation: UPDATE_BANNER().OPERATION,
               context: UPDATE_BANNER(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }

         const { id } = req.body;
         const updatedBanner = { ...req.body };
         if (req.file && req.file.key) {
            updatedBanner.bannerimage = req.file.key;
         }

         const banner = await knex('banner').where({ id })
            .first();
         if (!banner) {
            logger.error("Banner not found", {
               ...commonLogger(),
               error: "Banner not found",
               operation: UPDATE_BANNER().OPERATION,
               context: UPDATE_BANNER(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "banner"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }

         await knex('banner').where({ id })
            .update(updatedBanner);

         logger.info("Banner Updated", {
            ...commonLogger(),
            operation: UPDATE_BANNER().OPERATION,
            context: UPDATE_BANNER(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });

         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, { id }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: UPDATE_BANNER().OPERATION,
            context: UPDATE_BANNER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   deleteBanner: async (req, res) => {
      try {
         logger.info("Request to delete Banner", {
            ...commonLogger(),
            operation: DELETE_BANNER().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });

         // Check if 'id' is provided in the request body
         const { id } = req.body;
         if (!id) {
            return sendResponse("The id field is mandatory.", res,
               constant.CODE.INPUT_VALIDATION, {}, 0);
         }

         // Proceed with deletion if 'id' is provided
         const banner = await knex('banner').where({ id })
            .first();
         if (!banner) {
            logger.error("Banner not found", {
               ...commonLogger(),
               error: "Banner not found",
               operation: DELETE_BANNER().OPERATION,
               context: DELETE_BANNER(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "banner"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }

         await knex('banner').where({ id })
            .update({ status: true })
         logger.info("Banner Deleted", {
            ...commonLogger(),
            operation: DELETE_BANNER().OPERATION,
            context: DELETE_BANNER(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });

         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, { id }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: DELETE_BANNER().OPERATION,
            context: DELETE_BANNER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   imageValidation: async (req, res) => {
      try {

         const { id } = req.body;
         const product = await knex('products').where({ id })
            .first();
         if (!product) {
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "product"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         const { productImages } = product
         if (!Array.isArray(productImages) || productImages.length === 0) {
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "productImages"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         const watermarkedImages = [];
         for (const imageUrl of productImages) {
            const imageResponse = await axios({
               url: process.env.RENTTE_IMAGE_URL + imageUrl,
               responseType: "arraybuffer",
            });
            const imageBuffer = Buffer.from(imageResponse.data);
            const watermarkedImage = await sharp(imageBuffer)
               .composite([{ input: watermarkPath, gravity: "southeast" }])
               .toBuffer();
            const watermarkedKey = `watermarked/${Date.now()}-${Math.random().toString(36)
               .slice(2)}.jpg`;
            const params = {
               Bucket: process.env.AWS_BUCKET_NAME,
               Key: watermarkedKey,
               Body: watermarkedImage,
               ContentType: "image/jpg",
            };

            await s3Client.send(new PutObjectCommand(params));
            watermarkedImages.push(watermarkedKey);
         }
         await knex('products').where({ id })
            .update({
               productImages: JSON.stringify(watermarkedImages),
               isProductImageVerify: true,
            });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS,
            {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: IMAGE_VALIDATION().OPERATION,
            context: IMAGE_VALIDATION(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
};
