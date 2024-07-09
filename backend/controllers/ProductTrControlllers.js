const ProductTransaction=require('../models/ProductTrModel')
const axios =require('axios')

const moment = require('moment-timezone');

exports.SeedDataContoller=async(req, res) => {
    try {
      const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      const data = response.data;
      await ProductTransaction.deleteMany({});
     
      
      await ProductTransaction.insertMany(data);
      res.send('Database seeded successfully');
    } catch (error) {
      res.status(500).send(error.toString());
    }
  }
  
exports.TransactionsController = async (req, res) => {
  const { page = 1, perPage = 10, search = '', month } = req.query;
  const regex = new RegExp(search, 'i');


  const monthNumber = moment().month(month).format("M");
//   console.log(monthNumber);
  try {
    
    const transactions = await ProductTransaction.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: { $toDate: "$dateOfSale" } }, parseInt(monthNumber)]
            },
            $or: [
              { title: regex },
              { description: regex }
            ]
          }
        },
        { $skip: (page - 1) * perPage },
        { $limit: parseInt(perPage) }
      ]);
  
    

    res.json(transactions);
  } catch (error) {
    res.status(500).send(error.toString());
  }
};


exports.StatisticsController = async (req, res) => {
  const { month } = req.query;

  // Convert month name to month number (1-12)
  const monthNumber = moment().month(month).format("M");

  try {
    const statistics = await ProductTransaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: { $toDate: "$dateOfSale" } }, parseInt(monthNumber)]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: { $cond: { if: "$sold", then: "$price", else: 0 } } },
          totalSoldItems: { $sum: { $cond: { if: "$sold", then: 1, else: 0 } } },
          totalNotSoldItems: { $sum: { $cond: { if: { $not: "$sold" }, then: 1, else: 0 } } }
        }
      }
    ]);

  
    if (statistics.length === 0) {
      return res.status(404).json({ message: `No transactions found for ${month}` });
    }

   
    res.json(statistics[0]); 
  } catch (error) {
    res.status(500).send(error.toString());
  }
};


exports.BarChartDataController = async (req, res) => {
  const { month } = req.query;

 
  const monthNumber = moment().month(month).format("M");

  try {
    const barChartData = await ProductTransaction.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: { $toDate: "$dateOfSale" } }, parseInt(monthNumber)]
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ["$price", 0] }, { $lte: ["$price", 100] }] }, then: "0 - 100" },
                { case: { $and: [{ $gte: ["$price", 101] }, { $lte: ["$price", 200] }] }, then: "101 - 200" },
                { case: { $and: [{ $gte: ["$price", 201] }, { $lte: ["$price", 300] }] }, then: "201 - 300" },
                { case: { $and: [{ $gte: ["$price", 301] }, { $lte: ["$price", 400] }] }, then: "301 - 400" },
                { case: { $and: [{ $gte: ["$price", 401] }, { $lte: ["$price", 500] }] }, then: "401 - 500" },
                { case: { $and: [{ $gte: ["$price", 501] }, { $lte: ["$price", 600] }] }, then: "501 - 600" },
                { case: { $and: [{ $gte: ["$price", 601] }, { $lte: ["$price", 700] }] }, then: "601 - 700" },
                { case: { $and: [{ $gte: ["$price", 701] }, { $lte: ["$price", 800] }] }, then: "701 - 800" },
                { case: { $and: [{ $gte: ["$price", 801] }, { $lte: ["$price", 900] }] }, then: "801 - 900" },
                { case: { $gte: ["$price", 901] }, then: "901-above" }
              ],
              default: "Unknown"
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(barChartData);
  } catch (error) {
    res.status(500).send(error.toString());
  }
};

exports.PieChartDataController = async (req, res) => {
    const { month } = req.query;
  
    const monthNumber = moment().month(month).format("M");
  
    try {
      const pieChartData = await ProductTransaction.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: { $toDate: "$dateOfSale" } }, parseInt(monthNumber)]
            }
          }
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        }
      ]);
  
      res.json(pieChartData);
    } catch (error) {
      res.status(500).send(error.toString());
    }
  };
  
  exports.combinedApi= async (req, res) => {
    try {
      const [transactionsResponse, statisticsResponse, barChartDataResponse, pieChartDataResponse] = await Promise.all([
        axios.get('http://localhost:3000/task/transactions', { params: req.query }),
        axios.get('http://localhost:3000/task/statistics', { params: req.query }),
        axios.get('http://localhost:3000/task/bar', { params: req.query }),
        axios.get('http://localhost:3000/task/pie', { params: req.query })
      ]);
  
      const combinedData = {
        transactions: transactionsResponse.data,
        statistics: statisticsResponse.data,
        barChartData: barChartDataResponse.data,
        pieChartData: pieChartDataResponse.data
      };
  
      res.json(combinedData);
    } catch (error) {
      console.error('Error fetching combined data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }