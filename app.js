const express = require('express')
const handlebars = require('express-handlebars') // 引入 handlebars
const db = require('./models')
const app = express()
const port = 3000
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
app.use(express.urlencoded({ extended: true }))

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars') // 設定使用 Handlebars 做為樣板引擎


app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app, passport)

module.exports = app
