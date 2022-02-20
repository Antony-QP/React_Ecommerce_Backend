const express = require ('express')
const router = express.Router()

// Middlewares
const {authCheck, adminCheck} = require('../middlewares/auth')


// Import Controllers
const { create, listAll, remove, read, update, list, productCount, productStar, listRelated, searchFilters } = require('../controllers/product')

// Routes
router.post('/product', authCheck, adminCheck, create);
// Pagination
router.get('/products/total', productCount)
router.get('/products/:count', listAll);
router.delete('/product/:slug', authCheck, adminCheck, remove)
router.put('/product/:slug', authCheck, adminCheck, update)
router.get('/product/:slug', read)

// List recently added and best sellers
router.post('/products', list)

// rating
router.put('/product/star/:productId', authCheck, productStar);

// get related products
router.get("/product/related/:productId", listRelated)

// Search
router.post('/search/filters', searchFilters)

module.exports = router