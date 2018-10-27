const inquire = require('inquirer')
const mysql = require('mysql')
const chalk = require('chalk')

const connection = mysql.createConnection({
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "christian123",
    "database": "bamazonDB"
});

connection.connect(error => {
    if (error) throw error
    console.log(chalk.red.bgWhite("\n**** Hot Deals ****\n"))
    console.log("-----------------------------------");
    showProducts()
})

function openStore() {
    inquire.prompt([{
            type: "input",
            name: "choice",
            message: "Enter the ID # of your desired product",
            validate: value => (value !== "")
        },
        {
            type: "input",
            name: "quantity",
            message: "what quantity would you like?",
            validate: value => (value !== "")
        }
    ]).then(function (input) {
        console.log(input.choice)
        let id = input.choice
        let quantity = input.quantity
        connection.query("SELECT * FROM products Where ? ", 
            {
                id: id
            },
            function (err, res) {
                
                if (res[0].stock >= quantity) {
                    console.log(chalk.green("Total: $" + quantity * res[0].price) + "\n No taxes were levied on this Purchase" + "\nFree Shipping" + "\nThank you for shopping with us")
                    let stockLess = res[0].stock - quantity
                    checkout(id, stockLess)
                } else {
                    console.log( chalk.red.bgWhite("I'M SORRY\n" + "We currently do not have the supply to fufill your order please select differnt quantity or check back later"))
                    showProducts()
                }
            })
    })
}

function showProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log("-----------------------------------");
            console.log(chalk.red.bgWhite(+res[i].id) + " | " + chalk.blue.bgWhite(res[i].product) + " | " + chalk.green("$" +res[i].price));
        }
        console.log("-----------------------------------");
        openStore()
    });
}

function checkout(id, stockLess) {
    let num = id
    let q = stockLess
    inquire.prompt([{
            type: "input",
            name: "card",
            message: chalk.blue.bgWhite("Enter Your 16 Digit Card # (no dashes)"),
            validate: value => (value !== "" && value.length === 16 && value !== NaN)
        },
        {
            type: "input",
            name: "date",
            message: chalk.blue.bgWhite("Enter Your Expiration Date(mmyy)"),
            validate: value => (value !== "" && value.length === 4 && value !== NaN)
        },
        {
            type: "input",
            name: "code",
            message: chalk.blue.bgWhite("Enter Your Security Code (###)"),
            validate: value => (value !== "" && value.length === 3 && value !== NaN)
        }
    ]).then(function (ans) {

        if (ans.code === "123") {
            updateStore(num, q)
        }
        else {
            console.log(chalk.red.bgWhite("We both know thats not your card number. Credit Card fraud is a serious crime and the authorities have been dispatched to your location"))
            connection.end();
        }
    })
}

function updateStore(num, q) {
    let id = num

    let amt = q
    
    connection.query("UPDATE products SET ? Where ?",
        [{
                stock: amt,
            },
            {
                id: id,
            }
        ],
        function (err, res) {
            if (err) {
                console.log(err)
            }
            buyMore()
        })
}

function buyMore() {
    inquire.prompt([{
        type: "confirm",
        name: "spree",
        message: chalk.blue.bgWhite("Would you like to contine shopping?"),
        default: "false"
    }]).then(function (choice) {
        if (choice.spree != false) {
            showProducts()
        } else {
            console.log(chalk.blue.bgWhite("COME BACK SOON"))
            connection.end();
        }
    })
}