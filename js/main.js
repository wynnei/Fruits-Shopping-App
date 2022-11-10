// set date
const date = document.querySelector(".date")
date.innerHTML = new Date().getFullYear()
//close link
const navToggle = document.querySelector(".nav-toggle")
const linksContainer = document.querySelector(".links-container")
const links = document.querySelector(".links")
navToggle.addEventListener("click",function(){
    // linksContainer.classList.toggle("show-links")
    const containerHeight = linksContainer.getBoundingClientRect().height
    const linksHeight = links.getBoundingClientRect().height
    if (containerHeight === 0){
        linksContainer.style.height = `${linksHeight}px`
    }
    else{
        linksContainer.style.height = 0
    }
})
const navbar = document.querySelector("#nav")
const topLink = document.querySelector(".top-link")
//fixed navbar
window.addEventListener("scroll", function(){
 const scrollHeight = window.pageYOffset  
 const navHeight =navbar.getBoundingClientRect().height 
 
 if (scrollHeight > navHeight){
    navbar.classList.add("fixed-nav")
   
 }
 else{
    navbar.classList.remove("fixed-nav")
 }
 if (scrollHeight > 500){
    topLink.classList.add("show-link")
 }
 else{
    topLink.classList.remove("show-link")
 }
})
const scrollLinks = document.querySelectorAll(".scroll-link")
scrollLinks.forEach(function(link){
    link.addEventListener("click",function(e){
        //prevent default
        e.preventDefault()
        //navigate to specific sport
        const id = e.currentTarget.getAttribute("href").slice(1)
        const element = document.getElementById(id)
        const navHeight =navbar.getBoundingClientRect().height
        const containerHeight = linksContainer.getBoundingClientRect().height
        const fixedNav = navbar.classList.contains("fixed-nav")
        let position = element.offsetTop-navHeight
        if (!fixedNav){
            position = position-navHeight
        }
        if(navHeight > 82){
            position = position + containerHeight
        }
        window.scrollTo({
            left:0,
            top:position
        })
        linksContainer.style.height = 0

    })
})

//variables
const cartBtn =document.querySelector(".cart-btn")
const closeCartBtn =document.querySelector(".close-cart")
const clearCartBtn =document.querySelector(".clear-cart")
const cartDOM =document.querySelector(".cart")
const cartOverlay =document.querySelector(".cart-overlay")
const cartItems =document.querySelector(".cart-items")
const cartTotal =document.querySelector(".cart-total")
const cartContent =document.querySelector(".cart-content")
const productsDOM =document.querySelector(".products-center")

// cart
let cart =[]
//buttons
let buttonsDOM = []
//getting the products ;products method
class Products{
    async getProducts(){
        try{
            let result = await fetch("products.json")
            let data = await result.json()
            
        //product to hold the array
        let products = data.items
         //destructuring from the field in the json file
        products = products.map(item =>{
            const {title,price,description} = item.fields
            const {id} =item.sys
            const image = item.fields.image.fields.file.url
            return {title,price,id,image,description}
        })
        return products
    }
        catch(error){
            //console.log(error)
        }
        
    }
}
//ui class or display products
class UI{
    //displayProductd method
    displayProducts(products){
        let result =""
        products.forEach(product=>{
            //using templete literal
            result += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}> <i class="fa fa-shopping-cart"></i> add to cart</button>
                </div>
                <h3>${product.title}</h3>
                <p>${product.description}</p>
                <h4>$ ${product.price}</h4>
            </article>
            <!--end of single product --> `
        })
        productsDOM.innerHTML = result
        
    }
    getBagButtons(){
        //the ... will turn const buttons into an array
        //spread operator
        const buttons = [...document.querySelectorAll(".bag-btn")]
        //console.log(buttons)
        buttonsDOM = buttons 
        buttons.forEach(button =>{
            let id = button.dataset.id
            //console.log(id)
            let inCart = cart.find(item => item.id === id)
            if (inCart){
                button.innerText = "In Cart"
                button.disabled = true
            }
            
                button.addEventListener("click",event => {
                    event.target.innerText = "In Cart"
                    event.target.disabled = true
                    //get product from products
                    let cartItem = {...Storage.getProduct(id), amount:1} 
                    //console.log(cartItem)

                    //add product to the cart
                    cart = [...cart,cartItem]
                    //console.log(cart)
                    //save cart in local storage
                    Storage.saveCart(cart)
                    //set cart values
                    this.setCartValue(cart)
                    //display cart item
                    this.addCartItem(cartItem)
                    //show the cart
                    this.showCart()
                })
            
        })
      
    }
    setCartValue(cart){
        let tempTotal = 0
        let itemsTotal = 0 
        cart.map(item =>{
            tempTotal += item.price * item.amount
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal
        //console.log(cartTotal, cartItems);

    }
    addCartItem(item){
        const div = document.createElement("div")
        div.classList.add("cart-item")
        div.innerHTML = `
        <img src=${item.image} alt="product">
                    <div><h4>${item.title}</h4>
                    <h5>$${item.price}</h5>
                    
                <span class="remove-item" data-id = ${item.id}>remove</span></div>
                <div>
                <i class="fa fa-chevron-up" data-id = ${item.id}></i>
                <p class="item-amount" data-id = ${item.id}>${item.amount}</p>
                <i class="fa fa-chevron-down" data-id = ${item.id}></i>
            </div>`
            cartContent.appendChild(div)
           // console.log(cartContent);
    }
    //show cart method
    showCart(){
        cartOverlay.classList.add ("transparentBcg")
        cartDOM.classList.add ("showCart")
    }
    setupAPP(){
        cart = Storage.getCart()
        this.setCartValue(cart)
        this.populateCart(cart)
        //showCart call back function
        cartBtn.addEventListener("click",this.showCart)
        closeCartBtn.addEventListener("click",this.hideCart)

    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem (item))
    }
    hideCart(){
        cartOverlay.classList.remove ("transparentBcg")
        cartDOM.classList.remove ("showCart")
    }
    //clear cart button
    cartLogic(){
        clearCartBtn.addEventListener("click",() => this.clearCart ())
        cartContent.addEventListener("click",( event) => {
            //console.log(event.target)
            if (event.target.classList.contains("remove-item")){
                let removeItem = event.target
                let id = removeItem.dataset.id
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)
            }
            else if (event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target
                let id = addAmount.dataset.id
                //console.log (addAmount)
                //in the cart find an item with item id which matches the id in question
                let tempItem = cart.find(item => item.id === id)
                //update amount +1
                tempItem.amount = tempItem.amount + 1
                Storage.saveCart(cart)
                this.setCartValue(cart)
                addAmount.nextElementSibling.innerText = tempItem.amount

            }
            else if (event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target
                let id = lowerAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1
                if (tempItem.amount > 0){
                    Storage.saveCart(cart)
                    this.setCartValue(cart)
                    lowerAmount.previousElementSibling.innerText = tempItem.amount
                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeItem(id)
                }

            }

        })
    }
    clearCart(){
        //console.log(this)
        let cartItems = cart.map(item => item.id)
        //console.log(cartItems)
        cartItems.forEach(id => this.removeItem(id))
        //console.log(cartContent.children);
        while (cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id)
        this.setCartValue(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML =`<i class ="fa fa-shopping-cart"> </i> add to cart `

    }
    getSingleButton(id){
        //using array not unodered list
        return buttonsDOM.find(button => button.dataset.id === id)
    }
}
//local storage
class Storage{
    //static method ,it can be used without instanciating the class
    static saveProducts(products){
        //stringify products
        localStorage.setItem("products",JSON.stringify(products))
    }
    static getProduct(id){
        let products =JSON.parse(localStorage.getItem("products"))
        return products.find((product) =>{
            return product.id === id
        }) 
    }
    static saveCart (cart){
        localStorage.setItem("cart",JSON.stringify(cart))
    }
    static getCart(){
        //check if item exists in the cart if not reurn empty array
        return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[]
    }
   
}
const preloader = document.querySelector(".preloader")
window.addEventListener("load",()=>{
    preloader.classList.add("hide-preloader")
    //objects const ui,const products created from classes
    const ui = new UI()
    const products = new Products()
    // setup app
    ui.setupAPP()
    //get all products
    products.getProducts().then(products => {ui.displayProducts(products)
    Storage.saveProducts(products)
}).then(() =>{
    ui.getBagButtons()
    ui.cartLogic()
})
})
