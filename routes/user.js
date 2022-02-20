const express = require ('express')
const {authCheck} = require('../middlewares/auth')
const router = express.Router();

// Controllers
const { userCart, getUserCart, emptyCart, saveAddress, applyCouponToUserCart, createOrder, getOrders, addToWishlist, wishlist, removeFromWishlist} = require('../controllers/user')

router.post('/user/cart', authCheck, userCart)
router.get('/user/cart', authCheck, getUserCart)
router.delete('/user/cart', authCheck, emptyCart)
router.post('/user/address', authCheck, saveAddress)
router.post('/user/order', authCheck, createOrder)
router.get('/user/orders', authCheck, getOrders)

// Coupon
router.post('/user/cart/coupon', authCheck, applyCouponToUserCart)

// Wishlist

router.post('/user/wishlist', authCheck, addToWishlist)
router.get('/user/wishlist', authCheck, wishlist)
router.put('/user/wishlist/:productId', authCheck, removeFromWishlist)

module.exports = router