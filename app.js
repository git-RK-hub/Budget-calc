
//BUDGET CONTROLLER $$$$$$$$$$$$$$$$$$$$$$$$$$

var budgetController = (function(){
    
    var Income = function(id, description, value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    var Expense = function(id, description, value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0)
            this.percentages = Math.round((this.value / totalIncome)* 100) ;
        else
            this.percentages = -1 ;
    }
    Expense.prototype.getPercentage = function(){
        return this.percentages ;
    }
    var calculateTotal = function(type){
        var sum =0;
        data.allItems[type].forEach(function(current){
        sum += current.value;
        });
        data.total[type] = sum;
    }
    var data = {
       allItems: {
            exp: [ ],
            inc: [ ]
        },    
        total : {
            exp : 0,
            inc : 0
        },
        budgets: 0 ,
        percentage: -1
    };
    return {
        addItem: function(type, des, val){
            var newItem, ID ;
            // Create new ID
            if(data.allItems[type].length>0)
                ID = data.allItems[type][data.allItems[type].length-1].id +1;
            else 
                ID = 0;
            
            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des,val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem ; 
        },
        calculateBudget : function(){
        
             // 1. Calculate total income and expenses
                calculateTotal('inc');
                calculateTotal('exp');
                
             // 2. Calculate the budget: income-expense
                data.budgets = data.total.inc - data.total.exp ; 
             // 3. Calculate the precentage
                if(data.total.inc>0)
                    data.percentage = Math.round((data.total.exp/data.total.inc)*100) ;
                else 
                    data.percentage = -1;
        },
        getBudget : function(){
            return{
                budget: data.budgets,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            };
        },
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.total.inc);
            })
        },
        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc ;
        },
        deleteItem : function(type,id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id ;
            });
            index = ids.indexOf(id);
            if(index!== -1)
                data.allItems[type].splice(index,1);
        },
        testing : function(){
            console.log(data);
        }
        
    }
 })();


   
//UI CONTROLLER $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

var UIcontroller =(function(){
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    } ;
    
    var formatNumber = function(num , type){
        var numSplit,int,dec ;
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    }
    var nodeListforEach = function(list, callback){
            for(var i=0 ;i<list.length; i++){
                callback(list[i],i);
            }
    }
    return {
            getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        getDOMstrings : function(){
            return DOMStrings ;
        },
        addListItem : function(obj, type){
            // Create HTML string with placeholder text
            var html, newHtml ;
            if( type === 'inc'){
                element = DOMStrings.incomeContainer ;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"</i></button></div></div></div>' ;
            }
            else if( type === 'exp'){
                element = DOMStrings.expensesContainer ;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' ;
            }
              // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        clearFields: function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue)
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach (function(current,index,array){
                if(index !== 0)
                    current.value = '';
            fieldsArray[0].focus();
            });
        },
        displayBudget : function(obj)
        {
            var type = obj.budget>0 ? 'inc' : 'exp' ;
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            if(obj.percentage>0)
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            else 
                document.querySelector(DOMStrings.percentageLabel).textContent = ':p';
        },
        deleteListItem : function(selectorID){
            var el = document.getElementById(selectorID) ;
            el.parentNode.removeChild(el);
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            
            nodeListforEach(fields, function(current,index){
                if(percentages[index]>0){
                    current.textContent = percentages[index] + '%';
                }else
                    current.textContent = ':p';
            });
        },
        displayDate: function(){
            var now,month,months,year ;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year ;
        },
        changedType : function(){
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue );
            nodeListforEach(fields, function(cur){
               cur.classList.toggle('red-focus') ;
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red') ;
        }
    };
})();

//GLOBAL APP CONTROLLER $$$$$$$$$$$$$$$$$$$$$$$$$$

var controller = (function(budgetCtrl,UICtrl){
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
        
       document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
   
        //when any button is pressed on the browser the browser itself pass the keycode of the pressed key into the function() i.e., event = keycode and then we can compare the event value with the enter button key code. 
        //event.which is for old browser that doesn't support .keycode.
       document.addEventListener('keypress',function(event){
            //console.log(event);
            if(event.keycode === 13 || event.which ===13 )
            {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
        
    }
    var updatePercentages = function(){
        // 1. Calculate percentages
            budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
            var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
            UICtrl.displayPercentages(percentages);
    }
    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget in the UI
        UICtrl.displayBudget(budget);
    }
    var ctrlAddItem = function(){
       // 1. Get the feild input data
            var input = UICtrl.getInput();
            
        if(input.description !== '' && !isNaN(input.value) && input.value>0)
        {
            
            // 2. Add the item to the budgetContoller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value) ;
            
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
        
            // 4. Clear the fileds and focus back on description
            UICtrl.clearFields();
        
            // 5. Calcuate and update the budget in UI
            updateBudget();
            
            // 6. Calculate and update the percentages
            updatePercentages();
        }
              
       
   }
    var ctrlDeleteItem = function(event){
        var itemID ,splitID , type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }
        // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
        // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
        // 3. Update and show the new budget
            updateBudget();
        // 4. Calculate and update percentages
            updatePercentages();
    }
    return{
        init: function(){
            console.log('App has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1 
            });
            setupEventListeners();
        }
    } 
   
    
})(budgetController, UIcontroller);

controller.init();

















































