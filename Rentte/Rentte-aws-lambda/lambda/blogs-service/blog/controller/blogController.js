const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const knex = require("../../db/db");
const AWS = require("aws-sdk");
const logger = require("../../config/winston");
const LOGGER_MESSAGES = require("../../helper/loggerMessage");
const { CREATE_BLOG, UPDATE_BLOG, DELETE_BLOG, GET_BLOG_BY_ID,
   GET_ALL_BLOGS, CREATE_CAREER, GET_ALL_CAREERS,
   GET_CAREER_BY_ID, UPDATE_CAREER, DELETE_CAREER } = LOGGER_MESSAGES;
require('dotenv').config();
module.exports = {
   createBlog: async (req, res) => {
      try {
         logger.info("Create Blog", {
            ...commonLogger(),
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { content, title } = req.body;
         const blogData = {
            ...req.body,
            blogimage: req.files.map((image) => image.key),
         };
         blogData.blogimage = JSON.stringify(blogData.blogimage);
         const payload = {
            Bucket: process.env.AWS_BUCKET_BLOG,
            Key: `blogs/${Date.now()}_${title.replace(/\s+/g, "_")}.html`,
            Body: content, 
            ContentType: "text/html",
         };

         const s3 = new AWS.S3({
            accessKeyId: process.env.ID_S3,
            secretAccessKey: process.env.KEY_S3,
            region: process.env.AWS_BUCKET_REGION,
         });

         const uploadPromise = await s3.upload(payload).promise();
         const blogContentData = {
            title,
            contenturl: uploadPromise.Key,
         }
         if (blogData.blogimage.length > 0) {
            blogContentData.blogimage = blogData.blogimage }
         const [id] = await knex("blogs").insert(blogContentData)
            .returning("*");
         return sendResponse(constant.MESSAGE.SUCCESS, 
            res, constant.CODE.SUCCESS, { blog: id }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: CREATE_BLOG(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   updateBlog: async (req, res) => {
      try {
         const { blogid } = req.body;
         const { content, title } = req.body;
         if (!blogid) {
            logger.error("Blog ID is required", {
               ...commonLogger(),
               error: "Blog ID is required",
               context: UPDATE_BLOG(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'blog id'),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const existingBlog = await knex("blogs").where({ id: blogid })
            .first();
         if (!existingBlog) {
            return sendResponse("Blog not found", res, constant.CODE.NOT_FOUND, {}, 0);
         }
   
         const updateData = { title };
            
         const s3 = new AWS.S3({
            accessKeyId: process.env.ID_S3,
            secretAccessKey: process.env.KEY_S3,
            region: process.env.AWS_BUCKET_REGION,
         });

         if (content) {
            const payload = {
               Bucket: process.env.AWS_BUCKET_BLOG,
               Key: `blogs/${Date.now()}_${title.replace(/\s+/g, "_")}.html`,
               Body: content,
               ContentType: "text/html",
            };
   
            const uploadPromise = await s3.upload(payload).promise();
            updateData.contenturl = uploadPromise.Key;
            if (existingBlog.contenturl) {
               await s3.deleteObject({
                  Bucket: process.env.AWS_BUCKET_BLOG,
                  Key: existingBlog.contenturl,
               }).promise();
            }
         }
   
         if (req.files && req.files.length > 0) {
            const blogImages = req.files.map((image) => image.key);
            updateData.blogimage = JSON.stringify(blogImages);   
            if (existingBlog.blogimage) {
               const oldImages = existingBlog.blogimage;
               for (const oldImage of oldImages) {
                  await s3.deleteObject({
                     Bucket: process.env.AWS_BUCKET_NAME,
                     Key: oldImage,
                  }).promise();
               }
            }
         }
   
         await knex("blogs").where({ id: blogid })
            .update(updateData);
         const updatedBlog = await knex("blogs").where({ id: blogid })
            .first();
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { blog: updatedBlog },
            1,
         );
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: UPDATE_BLOG(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   blogDetail: async (req, res) => {
      try {
         const { blogid } = req.query;
         if (!blogid) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: 'blog id not found',
               context: GET_BLOG_BY_ID(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse('blog id not found',
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const blog = await knex("blogs")
            .select("*")
            .where("id", blogid)
            .first();
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            blog,
         }, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_BLOG_BY_ID(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   blogList: async (req, res) => {
      try {
         const { page = 1, limit = 10 } = req.query;
         const offset = (page - 1) * limit;
         const blogs = await knex('blogs')
            .select('*')
            .limit(limit)
            .offset(offset)
            .where('status', false)
            .orderBy('created_at', 'desc');
         const totalCountResult = await knex('blogs').count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            blogs,
            pagination: { page, limit, totalCount, totalPages },
         }, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_ALL_BLOGS(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   deleteBlog: async (req, res) => {
      try {
         const { id } = req.body;
         const blog = await knex("blogs").where({ id })
            .first();
         if (!blog) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: 'blog id not found',
               context: DELETE_BLOG(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse("Blog not found", res, constant.CODE.NOT_FOUND, {}, 0);
         }
         await knex("blogs").where({ id })
            .update({ status: true });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: DELETE_BLOG(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   createCareer: async (req, res) => {
      try {
         logger.info("Create Career", {
            ...commonLogger(),
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { content, title, jobfield, experience } = req.body;
         const payload = {
            Bucket: process.env.AWS_BUCKET_BLOG,
            Key: `blogs/${Date.now()}_${title.replace(/\s+/g, "_")}.html`,
            Body: content, 
            ContentType: "text/html",
         };

         const s3 = new AWS.S3({
            accessKeyId: process.env.ID_S3,
            secretAccessKey: process.env.KEY_S3,
            region: process.env.AWS_BUCKET_REGION,
         });

         const uploadPromise = await s3.upload(payload).promise();
         const careerContentData = {
            title,
            contenturl: uploadPromise.Key,
            jobfield,
            experience,
         }
         const [id] = await knex("careers").insert(careerContentData)
            .returning("*");
         return sendResponse(constant.MESSAGE.SUCCESS, 
            res, constant.CODE.SUCCESS, { career: id }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: CREATE_CAREER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   updateCareer: async (req, res) => {
      try {
         const { id } = req.body; // Career ID to update
         const { content, title } = req.body;
   
         // Fetch the existing career entry
         const existingCareer = await knex("careers").where({ id })
            .first();
         if (!existingCareer) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: 'careers not found',
               context: UPDATE_CAREER(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse("Career not found", res, constant.CODE.NOT_FOUND, {}, 0);
         }
   
         const updateData = { title };
   
         // Handle content update
         const s3 = new AWS.S3({
            accessKeyId: process.env.ID_S3,
            secretAccessKey: process.env.KEY_S3,
            region: process.env.AWS_BUCKET_REGION,
         });

         if (content) {
            const payload = {
               Bucket: process.env.AWS_BUCKET_BLOG,
               Key: `blogs/${Date.now()}_${title.replace(/\s+/g, "_")}.html`,
               Body: content,
               ContentType: "text/html",
            };
   
            const uploadPromise = await s3.upload(payload).promise();
            updateData.contenturl = uploadPromise.Key;
            if (existingCareer.contenturl) {
               await s3.deleteObject({
                  Bucket: process.env.AWS_BUCKET_BLOG,
                  Key: existingCareer.contenturl,
               }).promise();
            }
         }
   
         await knex("careers").where({ id })
            .update(updateData);
         const updatedCareer = await knex("careers").where({ id })
            .first();
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { career: updatedCareer },
            1,
         );
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: UPDATE_CAREER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   }, 
   careerDetail: async (req, res) => {
      try {
         const { id } = req.query;
         if (!id) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: 'career id not found',
               context: GET_CAREER_BY_ID(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse("Career id found", res, constant.CODE.NOT_FOUND, {}, 0);
         }
         const career = await knex("careers")
            .select("*")
            .where("id", id)
            .first();

         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            career,
         }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_CAREER_BY_ID(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   careerList: async (req, res) => {
      try {
         const { page = 1, limit = 10 } = req.query;
         const offset = (page - 1) * limit;
         const careers = await knex('careers')
            .select('*')
            .limit(limit)
            .offset(offset)
            .where('status', false)
            .orderBy('created_at', 'desc');
         const totalCountResult = await knex('careers').count('id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            careers,
            pagination: { page, limit, totalCount, totalPages },
         }, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: GET_ALL_CAREERS(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   deleteCareer: async (req, res) => {
      try {
         const { id } = req.body;
         const career = await knex("careers").where({ id })
            .first();
         if (!career) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: 'career id not found',
               context: DELETE_CAREER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse("Career not found", res, constant.CODE.NOT_FOUND, {}, 0);
         }
         await knex("careers").where({ id })
            .update({ status: true });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: DELETE_CAREER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
}
