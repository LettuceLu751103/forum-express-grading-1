const db = require('../../models')
const Category = db.Category
const categoryService = require('../../services/categoryService')


const categoryController = {
    getCategories: (req, res) => {
        categoryService.getCategories(req, res, data => {
            if (req.params.id) {
                return res.json(data)
            }
        })
    },
}

module.exports = categoryController
