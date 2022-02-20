const Product = require("../models/product");
const slugify = require("slugify");
const User = require("../models/user");

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    req.body.slug = slugify(req.body.title);
    const newProduct = await new Product(req.body).save();
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    // res.status(400).send("Create product failed");
    res.status(400).json({
      err: err.message,
    });
  }
};

exports.listAll = async (req, res) => {
  let products = await Product.find({})
    .limit(parseInt(req.params.count))
    .populate("category")
    .sort([["createdAt", "desc"]])
    .exec();
  res.json(products);
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndRemove({
      slug: req.params.slug,
    }).exec();
    res.json("Deleted", deleted, "on the backend");
  } catch (err) {
    console.log(err);
    return res.status(400).send("Product delete failed");
  }
};

exports.read = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category")
    .exec();
  res.json(product);
};

exports.update = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err, "Update product error");
    return res.status(400).json({
      err: err.message,
    });
  }
};

// exports.list = async(req, res) => {
//   try{
//     const { sort, order, limit } = req.body
//     const products = await Product.find({})
//     .populate('category')
//     .sort([[sort, order]])
//     .limit(limit)
//     .exec()
//     res.json(products)
//   }catch(err){
//     console.log(err)
//   }
// }

// With pagination
exports.list = async (req, res) => {
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 3;
    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .sort([[sort, order]])
      .limit(perPage)
      .exec();
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

exports.productCount = async (req, res) => {
  let total = await Product.find({}).estimatedDocumentCount().exec();
  res.json(total);
};

exports.productStar = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();
  const user = await User.findOne({ email: req.user.email }).exec();
  const { star } = req.body;

  // Need to check if currently logged in user has already rated the product
  let existingRatingObject = product.ratings.find(
    (element) => element.postedBy.toString() === user._id.toString()
  );

  // If the user hasn't left a rating the a rating will be added here
  if (existingRatingObject === undefined) {
    let ratingAdded = await Product.findByIdAndUpdate(
      product._id,
      {
        $push: { ratings: { star: star, postedBy: user._id } },
      },
      { new: true }
    ).exec();
    console.log(ratingAdded);
    res.json(ratingAdded);
  } else {
    const ratingUpdated = await Product.updateOne(
      {
        ratings: { $elemMatch: existingRatingObject },
      },
      { $set: { "ratings.$.star": star } },
      { new: true }
    ).exec();
    console.log("Rating updated: ", ratingUpdated);
    res.json(ratingUpdated);
  }
};

exports.listRelated = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();
  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .limit(3)
    .populate("category")
    .populate("postedBy")
    .exec();

  res.json(related);
};

// Search and Filters

const handleQuery = async (req, res, query) => {
  const products = await Product.find({ $text: { $search: query } })
    .populate("category", "_id name")
    .populate("postedBy", "_id name")
    .exec();

  res.json(products);
};

const handlePrice = async (req, res, price) => {
  try {
    let products = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate("category", "_id name")
      .populate("postedBy", "_id name")
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({ category })
      .populate("category", "_id name")
      .populate("postedBy", "_id name")
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleStar = (req, res, stars) => {
  Product.aggregate([
    {
      $project: {
        document: "$$ROOT",
        // title: "$title",
        floorAverage: {
          $floor: { $avg: "$ratings.star" }, // floor value of 3.33 will be 3
        },
      },
    },
    { $match: { floorAverage: stars } },
  ])
    .limit(12)
    .exec((err, aggregates) => {
      if (err) console.log("AGGREGATE ERROR", err);
      Product.find({ _id: aggregates })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .populate("postedBy", "_id name")
        .exec((err, products) => {
          if (err) console.log("PRODUCT AGGREGATE ERROR", err);
          res.json(products);
        });
    });
};

const handleShipping = async(req, res, shipping) => {
  const products = await Product.find({ shipping })
  .populate("category", "_id name")
  .populate("postedBy", "_id name")
  .exec();

  res.json(products);
}

const handleColor = async(req, res, color) => {
  const products = await Product.find({ color })
  .populate("category", "_id name")
  .populate("postedBy", "_id name")
  .exec();

  res.json(products);
}

const handleBrand = async(req, res, brand) => {
  const products = await Product.find({ brand })
  .populate("category", "_id name")
  .populate("postedBy", "_id name")
  .exec();

  res.json(products);
}

exports.searchFilters = async (req, res) => {
  console.log("The request .body from the backend controller", req.body);
  const { query, price, category, stars, color, brand, shipping } = req.body;
  try{
    if (query) {
      console.log("text ----> ", query);
      await handleQuery(req, res, query);
    }
  
    if (price !== undefined) {
      console.log("price ----> ", price);
      await handlePrice(req, res, price);
    }
  
    if (category) {
      console.log("category ----> ", category);
      await handleCategory(req, res, category);
    }
  
    if (stars) {
      console.log("stars ----> ", stars);
      await handleStar(req, res, stars);
    }

    if (shipping) {
      console.log("shipping ----> ", shipping);
      await handleShipping(req, res, shipping);
    }

    if (color) {
      console.log("color ----> ", color);
      await handleColor(req, res, color);
    }

    if (brand) {
      console.log("brand ----> ", brand);
      await handleBrand(req, res, brand);
    }
  }catch(err){
    console.log(err)
  }
};
