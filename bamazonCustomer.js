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

//on launch app should display a list of all items available for sale including ids, names, prices

function startApp(){
	connection.query("select * from products",
	// {
	// 	stock_quantity: > 0
	// },
	function(err, res){
		if (err) throw err;
		console.log("------All Items for Sale------");
		console.table(res);
		// res.forEach(function(row){
		// 	console.log(row.item_id + "        |  " + row.product_name + "  | " + row.price);
		// });
	purchase();
	});
	
}

function purchase(){
	inquirer
	.prompt([
		{
			name: "itemId",
			type: "input",
			message: "Enter ID of item you would like to purchase"
		},
		{
			name: "quantity",
			type: "input",
			message: "Enter number of units you would like to purchase"
		}

		]).then(function(answer){
			connection.query("select * from products where item_id=?", [answer.itemId],

				function(err, res){
					if (err) throw err;
					var stockQuantity;
					var price;

					for(var i = 0; i < res.length; i++){
						if(res[i].item_id == answer.itemId){
							stockQuantity = res[i].stock_quantity;
							price = res[i].price;
							item = res[i].product_name;
						}
					}

					if(stockQuantity < answer.quantity){
						console.log("insufficient quantity!");

						startApp();
					}
					else{
						var newQuantity = parseInt(stockQuantity) - parseInt(answer.quantity);
						var totalPrice = parseInt(price) * parseInt(answer.quantity);
						var query = connection.query("UPDATE products SET ? WHERE ?",
							[
								{
									stock_quantity: newQuantity
								},
								{
									item_id: answer.itemId
								}
							],
							function(error){
								if (error) throw error;
								console.log("Order Placed!  Total Price: $" + totalPrice + " for your order of " + answer.quantity + " " + item);
								connection.end();
							}
						);
					}
				}
			);
		});
}



