const express=require('express');

const { SeedDataContoller, TransactionsController,  StatisticsController, BarChartDataController, PieChartDataController, combinedApi } = require('../controllers/ProductTrControlllers');
const TransactionRouter=express.Router();

TransactionRouter.get('/seed-data',SeedDataContoller)
TransactionRouter.get('/transactions',TransactionsController)
TransactionRouter.get('/statistics',StatisticsController)
TransactionRouter.get('/bar',BarChartDataController)
TransactionRouter.get('/pie',PieChartDataController)
TransactionRouter.get('/combined-data',combinedApi)

module.exports=TransactionRouter