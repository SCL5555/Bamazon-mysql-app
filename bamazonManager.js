var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require("console.table");

//create db connection
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
});

connection.connect(function(err){
	if(err) throw err;
	console.log("connected as id" + connection.threadId);
	startApp();
});

function startApp(){
	inquirer
	.prompt({
		name: "chooseAction",
		type: "list",
		message: "Select which action you would like to do",
		choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
	}).then(function(answer){
			switch (answer.chooseAction){
				case "View Products for Sale":
					viewProduct();
					break;

				case "View Low Inventory":
					lowInventory();
					break;

				case "Add to Inventory":
					addInventory();
					break;

				case "Add New Product":
					addProduct();
					break;

				case "Exit":
					connection.end();
					break;
			}
	});
}

function viewProduct(){
	connection.query("select item_id, product_name, price, stock_quantity from products",

	function(err, res){
		if (err) throw err;
		console.log("------All Items for Sale------");
		console.table(res);
		startApp();
	});
}

function lowInventory(){
	connection.query("select item_id, product_name, price, stock_quantity from products where stock_quantity < 5",

	function(err, res){
		if (err) throw err;
		console.log("------All Items for Sale------");
		console.table(res);
		startApp();
	});
}

function addInventory(){
	inquirer
	.prompt([
			{
				name: "itemId",
				type: "input",
				message: "Enter ID of item you would like to add inventory to"
			},
			{
				name: "quantity",
				type: "input",
				message: "Enter number of units you would like to add to the inventory"
			}
		]).then(function(answer){
				connection.query("select * from products where item_id=?", [answer.itemId],
					function(err, res){
						if (err) throw err;
						var stockQuantity;
						var item;

						for(var i = 0; i < res.length; i++){
							if(res[i].item_id == answer.itemId){
								stockQuantity = res[i].stock_quantity;
								item = res[i].product_name;
							}
						}

						var newStockQuantity = parseInt(stockQuantity) + parseInt(answer.quantity);
						connection.query("UPDATE products SET ? WHERE ?",
							[
								{
									stock_quantity: newStockQuantity
								},
								{
									item_id: answer.itemId
								}

							],
							function(error){
								if (error) throw error;
								console.log("Stock Quantity for " + item + " has been increased from " + stockQuantity + " to " + newStockQuantity);
								startApp();
							}
						);
					}
				);
		});
}

function addProduct(){
	inquirer
	.prompt([
			{
				name: "productName",
				type: "input",
				message: "Enter the new product name"
			},
			{
				name: "deptName",
				type: "input",
				message: "Enter in the dept name for the product"
			},
			{
				name: "price",
				type: "input",
				message: "Enter in the price per unit for the new product"
			},
			{
				name: "stockQuantity",
				type: "input",
				message: "Enter in the number of units to add to inventory"
			}

		]).then(function(answer){
			connection.query("insert into products set ?",
				{
					product_name: answer.productName,
					department_name: answer.deptName,
					price: parseInt(answer.price),
					stock_quantity: parseInt(answer.stockQuantity)
				},
				function(error, res){
					if (error) throw error;
					console.log(res.affectedRows + " products inserted");
					startApp();
				}
			);
		});
}

