const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const knex = require("../../db/db");
const logger = require("../../config/winston");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { BLOCK_AND_UNBLOCK_USER } = LOGGER_MESSAGES;
module.exports = {
   blockAndUnblockUser: async (req,res) => {
      try {
         logger.info("Request to block and unblock user",{
            ...commonLogger(),
            operation: BLOCK_AND_UNBLOCK_USER().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { userId,isBlock } = req.body;
         const user = await knex("users").where({ id: userId });
         if (!user) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "User not found",
               operation: BLOCK_AND_UNBLOCK_USER().OPERATION,
               context: BLOCK_AND_UNBLOCK_USER(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}","user"),
               res,constant.CODE.NOT_FOUND,{},0);
         }
         await knex("users").where({ id: userId })
            .update({ status: isBlock });
         logger.info(`User ${isBlock === true} ? "Block": "Unblock"`,{
            ...commonLogger(),
            operation: BLOCK_AND_UNBLOCK_USER().OPERATION,
            context: BLOCK_AND_UNBLOCK_USER(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS,res,constant.CODE.SUCCESS,{},1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: BLOCK_AND_UNBLOCK_USER().OPERATION,
            context: BLOCK_AND_UNBLOCK_USER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message,res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
};
