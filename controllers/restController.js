const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Favorite = db.Favorite
const Like = db.Like
const tools = require('../_helpers')

const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.categoryId = categoryId
    }

    Restaurant.findAndCountAll({
      include: [Category],
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 ? 1 : page - 1
      const next = page + 1 ? pages : page + 1
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,

        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)

      }))

      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })

    })
  },

  getRestaurant: (req, res) => {
    Restaurant.findByPk(
      req.params.id,
      {
        include: [
          Category,
          { model: Comment, include: [User] },
          { model: User, as: 'FavoritedUsers' },
          { model: User, as: 'LikedUsers' },

        ]
      }
    )
      .then(restaurant => {
        // console.log(restaurant.toJSON())
        const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)

        const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
        const count = restaurant.viewCounts + 1
        restaurant.update({ viewCounts: count })
          .then(() => {
            return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited: isFavorited, isLiked: isLiked })

          })

      })
  },

  getFeeds: (req, res) => {

    Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ])
      .then(([restaurants, comments]) => {
        return res.render('feeds', { restaurants: restaurants, comments: comments })
      })
  },

  getDashBoard: (req, res) => {

    return Restaurant.findByPk(
      req.params.id, {
      include: [
        Category,
        { model: Comment }
      ]
    })
      .then(restaurant => {
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })


  },

  getTopRestaurant: (req, res) => {

    return Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' }
      ]
    }).then(restaurants => {
      // console.log(restaurants)
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.description.substring(0, 30),
        favoritedCount: restaurant.dataValues.FavoritedUsers.length,
        isFavorited: tools
          .getUser(req)
          .FavoritedRestaurants.filter(
            (data) => data.id === restaurant.dataValues.id
          )
      }))
      restaurants = restaurants
        .sort((a, b) => b.favoritedCount - a.favoritedCount)
        .slice(0, 10)
      return res.render('topRestaurant', { restaurants: restaurants })
    })

  }

}
module.exports = restController