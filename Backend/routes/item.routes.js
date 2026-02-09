import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { addItem, getItemsByShop, searchItems} from "../controllers/item.controller.js"
import { editItem } from "../controllers/item.controller.js"
import { getItemById } from "../controllers/item.controller.js"
import { deleteItem } from "../controllers/item.controller.js"
import { getItemByCity } from "../controllers/item.controller.js"
import { upload } from "../middlewares/multer.js"



const itemRouter=express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItem)
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.get("/get-by-id/:itemId",isAuth,getItemById)
itemRouter.get("/delete/:itemId",isAuth,deleteItem)
itemRouter.get("/get-by-city/:city",isAuth,getItemByCity)
itemRouter.get("/get-by-shop/:shopId",isAuth,getItemsByShop)
itemRouter.get("/search-items",isAuth,searchItems)
export default itemRouter