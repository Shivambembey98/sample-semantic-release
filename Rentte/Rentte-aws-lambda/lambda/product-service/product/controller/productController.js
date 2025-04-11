const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const logger = require("../../config/winston");
const knex = require("../../db/db");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { inputValidation } = require("../../validators/productValidator");
const { CREATE_PRODUCT, LIST_PRODUCT, RELATED_SEARCH, PRODUCT_DETAILS, 
   EDIT_PRODUCT, DELETE_PRODUCT, RENT_PRODUCT, CANCEL_RENT_PRODUCT, 
   LIST_PRODUCT_PARTNER,WISH_LIST_PRODUCT,
   PRODUCT_VIEW_COUNT,CHAT_CLICK_COUNT,PRODUCT_SEARCH_COUNT,
   GET_BANNER_LIST, GET_WISHLIST_PRODUCT } = LOGGER_MESSAGES;
module.exports = {
   creeateProduct: async (req, res) => {
      try {
         logger.info("Create Product", {
            ...commonLogger(),
            operation: CREATE_PRODUCT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { categoryId, subCategoryId } = req.body;
         const newProductData = {
            ...req.body,
            productImages: JSON.stringify(req.files.map((image) => image.key)),
            amount: Number(req.body.amount),
         };
         const requestValidation = await inputValidation(req.body, "productValidator");
         if (requestValidation) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Input error",
               operation: CREATE_PRODUCT().OPERATION,
               context: CREATE_PRODUCT(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         // const user = await knex("users").where({id: req.user.id}).first()
         const user = await knex("users").where({ id: req.user.id })
            .andWhere(function () {
               this.where({ userType: 'admin' }).
                  orWhere({ userType: 'partner' });
            })
            .first();
         if (!user) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: 'partner/admin not found',
               operation: CREATE_PRODUCT().OPERATION,
               context: CREATE_PRODUCT(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "partner"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         const category = await knex("category").where({ id: categoryId })
            .first();
         if (!category) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "category not found",
               operation: CREATE_PRODUCT().OPERATION,
               context: CREATE_PRODUCT(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "category"), res,
               constant.CODE.NOT_FOUND, {}, 0);
         }
         const subCategory = await knex("subcategory").where({ id: subCategoryId })
            .first();
         if (!subCategory) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "subCategory not found",
               operation: CREATE_PRODUCT().OPERATION,
               context: CREATE_PRODUCT(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "subCategory"), res,
               constant.CODE.NOT_FOUND, {}, 0);
         }
         newProductData.userid = user.id;
         const [id] = await knex("products").insert(newProductData)
            .returning("id");
         logger.info("Product created", {
            ...commonLogger(),
            operation: CREATE_PRODUCT().OPERATION,
            context: CREATE_PRODUCT(constant.CODE.SUCCESS).CONTEXT,
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
            operation: CREATE_PRODUCT().OPERATION,
            context: CREATE_PRODUCT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   listProduct: async (req, res) => {
      try {
         logger.info("List Product", {
            ...commonLogger(),
            operation: LIST_PRODUCT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { userid } = req.query
         const { lat, long, range, state, country, categoryId, subCategoryId,maxPrice } = req.query;
         const search = req.query.search ? `%${req.query.search}%` : null;
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const offset = (page - 1) * limit;

         // If neither lat/long nor state/country are provided, return an error
         if ((!lat || !long) && (!state && !country)) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Either lat/long or state/country is required",
               operation: LIST_PRODUCT().OPERATION,
               context: LIST_PRODUCT(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse('Either lat/long or state/country is required',
               res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }

         let products = knex('products')
            .select(
               'products.*',
               'category.categoryName as categoryName',
               'subcategory.subCategoryName as subcategoryName',
               knex.raw(`
                 json_build_object(
                     'id', "users"."id",
                     'email', "users"."email",
                     'profileimage', "users"."profileimage",
                     'firstName', "users"."firstName",
                     'mobile', "users"."mobileNumber",
                     'lastName', "users"."lastName",
                     'isVerifiedPartner', "users"."isVerifiedPartner"
                 ) as user
             `),
            )
            .leftJoin('category', 'products.categoryId', 'category.id')
            .leftJoin('subcategory', 'products.subCategoryId', 'subcategory.id')
            .leftJoin('users', 'products.userid', 'users.id')
            .modify((queryBuilder) => {
               if (userid) {
                  queryBuilder
                     .leftJoin('wishlist', function () {
                        this.on('products.id', '=', 'wishlist.productid')
                           .andOn('wishlist.userid', '=', knex.raw('?', [userid]));
                     })
                     .select(
                        knex.raw(`
                             CASE 
                                 WHEN wishlist.productid IS NOT NULL AND wishlist.status =
                                 'true' THEN true
                                 ELSE false
                             END AS "isWishlist"
                         `),
                     );
               } else {
                  queryBuilder.select(knex.raw('false AS "isWishlist"'));
               }
            })
            .where('products.isdelete', null)
            .where('products.isRented', true)
            .limit(limit)
            .orderBy('products.updated_at', 'desc')
            .offset(offset);

         if (state) {
            products = products.andWhere('products.state', state);
         }
         if (country) {
            products = products.andWhere('products.country', country);
         }
         if (categoryId) {
            products = products.andWhere('products.categoryId', categoryId);
         }
         if (subCategoryId) {
            products = products.andWhere('products.subCategoryId', subCategoryId);
         }
         if (maxPrice) {
            products = products.andWhereBetween('products.unitprice', [0, maxPrice]);
         }
         if (lat && long) {
            products = products.andWhereRaw(
               `ST_DWithin(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
               ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)`,
               [long, lat, range || 10000], // Default range of 10km if not provided
            );
         }
         if (search) {
            products = products.andWhere(function () {
               this.where('products.description', 'ILIKE', search)
                  .orWhere('products.address', 'ILIKE', search)
                  .orWhere('category.categoryName', 'ILIKE', search)
                  .orWhere('products.productname', 'ILIKE', search)
                  .orWhere('subcategory.subCategoryName', 'ILIKE', search);

            });
         }

         products = await products;
         const totalCountResult = await knex('products').count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);

         logger.info("Product Listed", {
            ...commonLogger(),
            operation: LIST_PRODUCT().OPERATION,
            context: LIST_PRODUCT(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });

         return sendResponse(constant.MESSAGE.SUCCESS,
            res, constant.CODE.SUCCESS,
            { products, pagination: { page, limit, totalCount, totalPages } }, 1);

      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: LIST_PRODUCT().OPERATION,
            context: LIST_PRODUCT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   productDetails: async (req, res) => {
      try {
         logger.info("Product details", {
            ...commonLogger(),
            operation: PRODUCT_DETAILS().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productId, userid } = req.query;
         if (!productId) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: ("Input error"),
               operation: PRODUCT_DETAILS().OPERATION,
               context: PRODUCT_DETAILS(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'product id'), 
               res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const detailsOfProduct = await knex('products')
            .select(
               'products.*',
               'category.categoryName as categoryName',
               'subcategory.subCategoryName as subcategoryName',
               knex.raw(`
                json_build_object(
                  'id', users.id,
                  'email', users.email,
                  'profileimage', users.profileimage,
                  'firstName', users."firstName",
                  'mobile', users."mobileNumber",
                  'lastName', users."lastName",
                  'isVerifiedPartner', users."isVerifiedPartner"
                ) as user
              `),
            )
            .leftJoin('category', 'products.categoryId', 'category.id')
            .leftJoin('subcategory', 'products.subCategoryId', 'subcategory.id')
            .leftJoin('users', 'products.userid', 'users.id')
            .where('products.isdelete', null)
            .where('products.id', productId)
            .first(); // Fetch only the first matching result

         if (!userid) {detailsOfProduct.isWishlist = false;}
         if (userid) {
            const findWishListProduct = await knex('wishlist')
               .where({ userid, productid: productId })
               .first();
            if (!findWishListProduct) {
               detailsOfProduct.isWishlist = false;
            } else {
               detailsOfProduct.isWishlist = true;
            }

         }
         if (!detailsOfProduct) {
            logger.error("Exception Error", {
               ...commonLogger(),
               operation: PRODUCT_DETAILS().OPERATION,
               context: PRODUCT_DETAILS(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}","product detail"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         return sendResponse(constant.MESSAGE.SUCCESS, res, 
            constant.CODE.SUCCESS, { detailsOfProduct }, 1);
      } catch (error) {
         logger.error("Exception Error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: PRODUCT_DETAILS().OPERATION,
            context: PRODUCT_DETAILS(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   relatedSearch: async (req, res) => {
      try {
         logger.info("Relatd search", {
            ...commonLogger(),
            operation: RELATED_SEARCH().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.query,
            },
         });
         const { state, country, 
            categoryId, subCategoryId, userid } = req.query; // Add userid to the query
         const baseQuery = `
            SELECT 
                "products".*,
                "category"."categoryName" AS "categoryName",
                "subcategory"."subCategoryName" AS "subcategoryName",
                json_build_object(
                    'id', "users"."id",
                    'email', "users"."email",
                    'profileimage', "users"."profileimage",
                    'firstName', "users"."firstName",
                    'mobile', "users"."mobileNumber",
                    'lastName', "users"."lastName",
                    'isVerifiedPartner', users."isVerifiedPartner"
                ) AS user,
                CASE 
                    WHEN wishlist.productid IS NOT NULL AND wishlist.status = 'true' THEN true
                    ELSE false
                END AS isWishlist
            FROM 
                "products"
            LEFT JOIN "category" ON "products"."categoryId" = "category"."id"
            LEFT JOIN "subcategory" ON "products"."subCategoryId" = "subcategory"."id"
            LEFT JOIN "users" ON "products"."userid" = "users"."id"
            LEFT JOIN "wishlist" ON "wishlist"."productid" = 
            "products"."id" AND "wishlist"."userid" = ${userid ? userid : null}
            WHERE "products"."isdelete" IS NULL
        `;
        
         const conditions = [];
         if (state) {
            conditions.push(`"products"."state" = '${state}'`);
         }
         if (country) {
            conditions.push(`"products"."country" = '${country}'`);
         }
         if (categoryId) {
            conditions.push(`"products"."categoryId" = ${categoryId}`);
         }
         if (subCategoryId) {
            conditions.push(`"products"."subCategoryId" = ${subCategoryId}`);
         }
        
         // Append dynamic conditions to the base query
         const whereClause = conditions.length ? ` AND ${conditions.join(' AND ')}` : '';
         const finalQuery = `${baseQuery} ${whereClause}
         ORDER BY "products"."created_at" DESC LIMIT 10;`;
         const products = await knex.raw(finalQuery);
         return sendResponse(constant.MESSAGE.SUCCESS,
            res, constant.CODE.SUCCESS,
            { products: products.rows }, 1);

      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: RELATED_SEARCH().OPERATION,
            context: RELATED_SEARCH(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.query,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   editProduct: async (req, res) => {
      try {
         logger.info("Edit Product", {
            ...commonLogger(),
            operation: EDIT_PRODUCT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         if (!req.user.id) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: 'user id not found',
               operation: EDIT_PRODUCT().OPERATION,
               context: EDIT_PRODUCT(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "user"),
               res, constant.CODE.NOT_FOUND, {}, 0); 
         }
         const updatedProductData = { ...req.body };
         if (req.files.length > 0) {
            updatedProductData.productImages = JSON.stringify(req.files.map((image) => image.key));
         }
         const { productId } = req.query;
         if (!productId) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: ("Input error"),
               operation: EDIT_PRODUCT().OPERATION,
               context: EDIT_PRODUCT(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "product id"), 
               res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const user = await knex("users").where({ id: req.user.id })
            .andWhere(function () {
               this.where({ userType: 'admin' }).
                  orWhere({ userType: 'partner' });
            })
            .first();
         if (!user) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "user not found",
               operation: EDIT_PRODUCT().OPERATION,
               context: EDIT_PRODUCT(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "partner"),
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         await knex("products").where({ id: productId })
            .update(updatedProductData);
         logger.info("Edit Product", {
            ...commonLogger(),
            operation: EDIT_PRODUCT().OPERATION,
            context: EDIT_PRODUCT(constant.CODE.SUCCESS).CONTEXT,
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
            operation: EDIT_PRODUCT().OPERATION,
            context: EDIT_PRODUCT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   deleteProduct: async (req, res) => {
      try {
         logger.info("Delete product", {
            ...commonLogger(),
            operation: DELETE_PRODUCT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productId } = req.query;
         if (!productId) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "product id not found",
               operation: DELETE_PRODUCT().OPERATION,
               context: DELETE_PRODUCT(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", 'product id'),
               res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const category = await knex('products').where({ id: productId })
            .first();
         if (!category) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "category not found",
               operation: DELETE_PRODUCT().OPERATION,
               context: DELETE_PRODUCT(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", "category"), 
               res, constant.CODE.NOT_FOUND, {}, 0);
         }
         await knex('products').where({ id: productId })
            .update({ isdelete: true });
         logger.info("Product Deleted", {
            ...commonLogger(),
            operation: DELETE_PRODUCT().OPERATION,
            context: DELETE_PRODUCT(constant.CODE.SUCCESS).CONTEXT,
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
            operation: DELETE_PRODUCT().OPERATION,
            context: DELETE_PRODUCT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   rentProduct: async (req, res) => {
      try {
         logger.info("Error selling product", {
            ...commonLogger(),
            operation: RENT_PRODUCT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productId } = req.body;
         if (!productId) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Product id not found",
               operation: RENT_PRODUCT().OPERATION,
               context: RENT_PRODUCT(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", 'product id'),
               res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const checkProductOnSell = await knex("products")
            .where({ isRented: true, id: productId })
            .first();
         if (checkProductOnSell) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "Product already exists",
               operation: RENT_PRODUCT().OPERATION,
               context: RENT_PRODUCT(constant.MESSAGE.RENT_PRODUCT).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.RENT_PRODUCT.replace('{{key}}', 'sell'), 
               res, constant.CODE.ALREADY_EXIST, {}, 0);
         }
         await knex("products").where({ id: productId })
            .update({ isRented: true });
         logger.info("Ready to sell product", {
            ...commonLogger(),
            operation: RENT_PRODUCT().OPERATION,
            context: RENT_PRODUCT(constant.CODE.SUCCESS).CONTEXT,
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
            operation: RENT_PRODUCT().OPERATION,
            context: RENT_PRODUCT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   cancelRentProduct: async (req, res) => {
      try {
         logger.info("Product Error", {
            ...commonLogger(),
            operation: CANCEL_RENT_PRODUCT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productId } = req.body;
         if (!productId) {
            logger.error("Error", {
               ...commonLogger(),
               error: "Input error",
               operation: CANCEL_RENT_PRODUCT().OPERATION,
               context: CANCEL_RENT_PRODUCT(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}", 'product id'), 
               res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const checkProductOnSell = await knex("products")
            .where({ isRented: false, id: productId })
            .first();
         if (checkProductOnSell) {
            logger.error(" Exception error", {
               ...commonLogger(),
               error: "Product already exists",
               operation: CANCEL_RENT_PRODUCT().OPERATION,
               context: CANCEL_RENT_PRODUCT(constant.CODE.ALREADY_EXIST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse('product already cancelled', 
               res, constant.CODE.ALREADY_EXIST, {}, 0);
         }
         await knex("products").where({ id: productId })
            .update({ isRented: false });
         logger.info("Cannot rent product", {
            ...commonLogger(),
            operation: CANCEL_RENT_PRODUCT().OPERATION,
            context: CANCEL_RENT_PRODUCT(constant.CODE.SUCCESS).CONTEXT,
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
            operation: CANCEL_RENT_PRODUCT().OPERATION,
            context: CANCEL_RENT_PRODUCT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   listProductPartner: async (req, res) => {
      try {
         logger.info("List Partner", {
            ...commonLogger(),
            operation: LIST_PRODUCT_PARTNER().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 10;

         // Query to fetch products with their category and subcategory details
         const products = await knex('products')
            .select(
               'products.id as id',
               'products.productname',
               'products.brandname',
               'products.description',
               'products.productImages',
               'products.state',
               'products.country',
               'products.city',
               'products.price',
               'products.amount',
               'products.quantity',
               'products.unitprice',
               'products.rentalType',
               'products.rentalperiod',
               'products.created_at',
               'products.isRented',
               'products.isProductImageVerify',
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
            .andWhere('products.userid', req.user.id);
         // .limit(limit)
         // .offset(offset);
         // Count total products for pagination
         const totalCountResult = await knex('products')
            .where('isdelete', null)
            .count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         logger.info("Product partner Listed", {
            ...commonLogger(),
            operation: LIST_PRODUCT_PARTNER().OPERATION,
            context: LIST_PRODUCT_PARTNER(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS,
            res, constant.CODE.SUCCESS,
            { products, pagination: { page, limit, totalCount, totalPages } }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: LIST_PRODUCT_PARTNER().OPERATION,
            context: LIST_PRODUCT_PARTNER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   wishListProduct: async (req, res) => {
      try {
         logger.info("Add wishlist",{
            ...commonLogger(),
            operation: WISH_LIST_PRODUCT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productId } = req.body;
         const { id } = req.user;
         const requestValidation = await inputValidation(req.body, 'wishList');
         if (requestValidation) {
            logger.error('Exception error',{
               ...commonLogger(),
               error: "validation error",
               operation: WISH_LIST_PRODUCT().OPERATION,
               context: WISH_LIST_PRODUCT(constant.CODE.INPUT_VALIDATION),
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const findWishListProduct = await knex('wishlist').
            where({ productid: productId, userid: id })
            .first();
         if (!findWishListProduct) {
            await knex('wishlist').insert({
               productid: productId,
               userid: id,
               status: true,
            });
            return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
         }
         if (findWishListProduct) {
            const { status } = findWishListProduct;
            await knex('wishlist').where({ productid: productId, userid: id })
               .update({ status: !status });
            return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
         }
         logger.error('Exception error',{
            ...commonLogger(),
            error: "Fail to add wishlist",
            operation: WISH_LIST_PRODUCT().OPERATION,
            context: WISH_LIST_PRODUCT(constant.CODE.BAD_REQUEST),
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.BAD_REQUEST, res, constant.CODE.BAD_REQUEST, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: WISH_LIST_PRODUCT().OPERATION,
            context: WISH_LIST_PRODUCT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   getWishListProduct: async (req,res) => {
      try {
         const { id } = req.user;
         const { page = 1, limit = 10 } = req.query;
         const offset = (page - 1) * limit;
         const wishlistItems = await knex('wishlist')
            .select(
               'wishlist.*',
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
                'productName', products.productname,
                'price', products.unitprice,
                'rentalType', "products"."rentalType",
                'state', products.state,
                'city', products.city,
                'country', products.country
              ) as product
             `),
            )
            .leftJoin('products', 'wishlist.productid', 'products.id')
            .where('wishlist.userid', id)
            .where('wishlist.status', true)
            .limit(limit)
            .offset(offset);
     
         const totalRecords = await knex('wishlist')
            .count('id as count')
            .where('userid', id)
            .first();
         const totalPages = Math.ceil(totalRecords.count / limit);
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {
               wishlistItems,
               totalRecords: totalRecords.count,
               totalPages,
               currentPage: page,
            },
            1,
         );
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_WISHLIST_PRODUCT(constant.CODE.INTERNAL_SERVER_ERROR),
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
   productViewCount: async (req,res) => {
      try {
         logger.info("product view count",{
            ...commonLogger(),
            operation: PRODUCT_VIEW_COUNT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productId } = req.body;
         if (!productId) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "product id not found",
               operation: PRODUCT_VIEW_COUNT().OPERATION,
               context: PRODUCT_VIEW_COUNT(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.
               replace("{{key}}",'product id'),res,constant.CODE.NOT_FOUND,{},0);
         }
         const updateViewCount = await knex('products').where({ id: productId })
            .increment('viewcount',1);
         if (updateViewCount === 1) {
            return sendResponse(constant.MESSAGE.VIEW_COUNT,res,constant.CODE.SUCCESS,{},1);
         }
         logger.error('Exception error',{
            ...commonLogger(),
            error: "Fail to create product view count",
            operation: PRODUCT_VIEW_COUNT().OPERATION,
            context: PRODUCT_VIEW_COUNT(constant.CODE.BAD_REQUEST),
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: PRODUCT_VIEW_COUNT().OPERATION,
            context: PRODUCT_VIEW_COUNT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   chatClickCount: async (req,res) => {
      try {
         logger.info("Chat click count",{
            ...commonLogger(),
            operation: CHAT_CLICK_COUNT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productId } = req.body;
         if (!productId) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: 'product id not found',
               operation: CHAT_CLICK_COUNT().OPERATION,
               context: CHAT_CLICK_COUNT(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.
               replace("{{key}}",'product id'),res,constant.CODE.NOT_FOUND,{},0);
         }
         const chatClickCount = await knex('products').where({ id: productId })
            .increment('clickcount',1);
         if (chatClickCount === 1) {
            return sendResponse(constant.MESSAGE.CLICK_COUNT,res,constant.CODE.SUCCESS,{},1);
         }
         logger.error("Exception error", {
            ...commonLogger(),
            error: 'Fail to increment clickcount',
            operation: CHAT_CLICK_COUNT().OPERATION,
            context: CHAT_CLICK_COUNT(constant.CODE.NOT_FOUND).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: CHAT_CLICK_COUNT().OPERATION,
            context: CHAT_CLICK_COUNT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   productSearchCount: async (req,res) => {
      try {
         logger.info("Product search count", {
            ...commonLogger(),
            operation: PRODUCT_SEARCH_COUNT().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { productIdList } = req.body;
         if (productIdList.length === 0) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: "product id not found",
               operation: PRODUCT_SEARCH_COUNT().OPERATION,
               context: PRODUCT_SEARCH_COUNT(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.ID_LIST_INVALID,
               res,constant.CODE.BAD_REQUEST,{},0);
         }
         const updateProductSearchCount = await knex('products').whereIn('id', productIdList)
            .increment('searchcount',1);
         if (updateProductSearchCount >= 1) {
            return sendResponse(constant.MESSAGE.UPDATE_SERACH_COUNT,
               res,constant.CODE.SUCCESS,{},1);   
         }
         logger.error("Exception error", {
            ...commonLogger(),
            error: "fail to create search count product",
            operation: PRODUCT_SEARCH_COUNT().OPERATION,
            context: PRODUCT_SEARCH_COUNT(constant.CODE.NOT_FOUND).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: PRODUCT_SEARCH_COUNT().OPERATION,
            context: PRODUCT_SEARCH_COUNT(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   getFeaturedProduct: async (req, res) => {
      try {
         logger.info("Relatd search", {
            ...commonLogger(),
            operation: RELATED_SEARCH().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.query,
            },
         });
         const {  userid } = req.query; // Add userid to the query
         const baseQuery = `
            SELECT 
                "products".*,
                "category"."categoryName" AS "categoryName",
                "subcategory"."subCategoryName" AS "subcategoryName",
                json_build_object(
                    'id', "users"."id",
                    'email', "users"."email",
                    'profileimage', "users"."profileimage",
                    'firstName', "users"."firstName",
                    'mobile', "users"."mobileNumber",
                    'lastName', "users"."lastName",
                    'isVerifiedPartner', users."isVerifiedPartner"
                ) AS user,
                CASE 
                    WHEN wishlist.productid IS NOT NULL AND wishlist.status = 'true' THEN true
                    ELSE false
                END AS isWishlist
            FROM 
                "products"
            LEFT JOIN "category" ON "products"."categoryId" = "category"."id"
            LEFT JOIN "subcategory" ON "products"."subCategoryId" = "subcategory"."id"
            LEFT JOIN "users" ON "products"."userid" = "users"."id"
            LEFT JOIN "wishlist" ON "wishlist"."productid" = 
            "products"."id" AND "wishlist"."userid" = ${userid ? userid : null}
            WHERE "products"."isdelete" IS NULL
        `;
        
         const finalQuery = `${baseQuery}
         ORDER BY 
            "products"."viewcount" DESC
         LIMIT 8;`;
         const products = await knex.raw(finalQuery);
         return sendResponse(constant.MESSAGE.SUCCESS,
            res, constant.CODE.SUCCESS,
            { products: products.rows }, 1);

      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: RELATED_SEARCH().OPERATION,
            context: RELATED_SEARCH(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.query,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   getBannerList: async (req, res) => {
      try {
         const bannerList = await knex('banner').select('*');
         return sendResponse(constant.MESSAGE.SUCCESS,
            res, constant.CODE.SUCCESS,
            { bannerList }, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: GET_BANNER_LIST().OPERATION,
            context: GET_BANNER_LIST(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.query,
            },
         })
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
}
