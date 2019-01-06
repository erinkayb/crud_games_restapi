const express = require("express")
const app = express()
const methodOverride = require("method-override")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const port = process.env.PORT || 3000

mongoose.connect("mongodb://localhost/gamesdb")
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

var gamesSchema = new mongoose.Schema({
  name: String,
  genre: [],
  publisher: String,
  release_date: Date,
  platforms: []
})

var Games = mongoose.model("Games", gamesSchema)

app.get("/", (req, res) => {
  res.redirect("/games")
})
// Get all games and search games
app.get("/games", (req, res) => {
  if (req.query.searchName) {
    const regex = new RegExp(escapeRegex(req.query.searchName), "gi")
    Games.find({ name: regex }, (err, games) => {
      if (err) {
        console.log(err)
      } else {
        res.render("index", { games: games })
      }
    })
  }
  if (req.query.searchGenre) {
    const regex = new RegExp(escapeRegex(req.query.searchGenre), "gi")
    Games.find({ genre: { $elemMatch: { $regex: regex } } }, (err, games) => {
      if (err) {
        console.log(err)
      } else {
        res.render("index", { games: games })
      }
    })
  }
  if (req.query.searchPlatform) {
    const regex = new RegExp(escapeRegex(req.query.searchPlatform), "gi")
    Games.find(
      { platforms: { $elemMatch: { $regex: regex } } },
      (err, games) => {
        if (err) {
          console.log(err)
        } else {
          res.render("index", { games: games })
        }
      }
    )
  }
  if (
    (req.query.searchName &&
      req.query.searchGenre &&
      req.query.searchPlatform) == null
  ) {
    Games.find({}, (err, games) => {
      if (err) {
        console.log(err)
      } else {
        res.render("index", { games: games })
      }
    })
  }
})

// New Route
app.get("/games/new", (req, res) => {
  res.render("new")
})

// Create Route
app.post("/games", (req, res) => {
  let newGame = req.body.games.name
  console.log(newGame)
  Games.create(
    {
      name: req.body.games.name,
      genre: [req.body.games.genre],
      publisher: req.body.games.publisher,
      release_date: req.body.games.release_date,
      platforms: [req.body.games.platforms]
    },
    (err, newGame) => {
      if (err) {
        console.log(err)
      } else {
        res.redirect("/games")
      }
    }
  )
})

// show route
app.get("/games/:id", (req, res) => {
  Games.findById(req.params.id, (err, foundGame) => {
    if (err) {
      console.log(err)
    } else {
      res.render("show", { game: foundGame })
    }
  })
})

// Edit route
app.get("/games/:id/edit", (req, res) => {
  Games.findById(req.params.id, (err, foundGame) => {
    if (err) {
      console.log(err)
    } else {
      res.render("edit", { game: foundGame })
    }
  })
})

// Update Route
app.put("/games/:id", (req, res) => {
  Games.findByIdAndUpdate(req.params.id, req.body.games, (err, updatedGame) => {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/games/" + req.params.id)
    }
  })
})

// Delete Route
app.delete("/games/:id", (req, res) => {
  Games.findByIdAndRemove(req.params.id, err => {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/games")
    }
  })
})

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}
app.listen(port, () => console.log(`listening on port ${port}!`))
