const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const imgur = require('imgur-node-api')
// const { userInfo } = require('os')
const IMGUR_CLIENT_ID = '0f45c06002b9fdc'

const adminService = {
    getRestaurants: (req, res, callback) => {
        return Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
            callback({ restaurants: restaurants })
        })
    },

    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            include: [Category]
        }).then(restaurant => {
            callback({ restaurant: restaurant.toJSON() })
        })
    },

    postRestaurant: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: "name didn't exist" })
        }
        const { file } = req // equal to const file = req.file
        if (file) {
            console.log('進到有圖片區域')
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                return Restaurant.create({
                    name: req.body.name,
                    tel: req.body.tel,
                    address: req.body.address,
                    opening_hours: req.body.opening_hours,
                    description: req.body.description,
                    image: file ? img.data.link : null,
                    CategoryId: req.body.categoryId
                }).then((restaurant) => {
                    callback({ status: 'success', message: 'restaurant was successfully created' })
                })
            })
        } else {
            console.log('進到沒有圖片區域')

            return Restaurant.create({
                name: req.body.name,
                tel: req.body.tel,
                address: req.body.address,
                opening_hours: req.body.opening_hours,
                description: req.body.description,
                CategoryId: req.body.categoryId
            }).then((restaurant) => {
                console.log('準備將存入數據庫的資料回調給adminService')
                callback({ status: 'success', message: 'restaurant was successfully created' })
            })
        }
    },

    deleteRestaurant: (req, res, callback) => {

        return Restaurant.findByPk(req.params.id)
            .then((restaurant) => {
                if (restaurant) {
                    restaurant.destroy()
                        .then((restaurant) => {
                            callback({ status: 'success', message: 'ok' })
                        })
                } else {
                    callback({ status: 'failure', message: 'fail' })
                }
            })
    },
}


module.exports = adminService