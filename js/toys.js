// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const toysDOM = document.querySelector(".toys-center");
let cart = [];


class Toys {
    async getToys() {
        try {
            let result = await fetch("toys.json");
            let data = await result.json();

            let toys = data.items;
            toys = toys.map(item => {
                const {
                    title,
                    price
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = item.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image
                };
            });
            console.log(toys);

            return toys;
        } catch (error) {
            console.log(error);
        }
    }
}

// ui
class UIS {
    displayToys(toys) {
        let result = "";
        toys.forEach(toy => {
            result += `
     <!-- single toy -->
          <article class="toy">
            <div class="img-container">
              <img
                src=${toy.image}
              
                class="toy-img"
              />
            
            </div>
            <h3>${toy.title}<br>$${toy.price}</h3>
            <button class="bag-btn" data-id=${toy.id}>
            <i class="fas fa-shopping-cart"></i>
            add to bag
          </button>
          </article>
          <!-- end of single product -->
     `;
        });
        toysDOM.innerHTML = result;
    }


    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttons.forEach(button => {
            let id = button.dataset.id;

            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            } else {
                button.addEventListener("click", event => {
                    // disable button
                    event.target.innerText = "In Bag";
                    event.target.disabled = true;
                    // add to cart
                    let cartItem = {
                        ...Storage.getToy(id),
                        amount: 1
                    };
                    cart = [...cart, cartItem];
                    Storage.saveCart(cart);
                    // add to DOM
                    this.setCartValues(cart);
                    this.addCartItem(cartItem);
                    this.showCart();
                });
            }
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `<!-- cart item -->
            <!-- item image -->
            <img src=${item.image} alt="product" />
            <!-- item info -->
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <!-- item functionality -->
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">
                ${item.amount}
              </p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
          <!-- cart item -->
    `;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cart = cart.filter(item => item.id !== id);
                console.log(cart);

                this.setCartValues(cart);
                Storage.saveCart(cart);
                cartContent.removeChild(removeItem.parentElement.parentElement);
                const buttons = [...document.querySelectorAll(".bag-btn")];
                buttons.forEach(button => {
                    if (parseInt(button.dataset.id) === id) {
                        button.disabled = false;
                        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
                    }
                });
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cart = cart.filter(item => item.id !== id);
                    // console.log(cart);

                    this.setCartValues(cart);
                    Storage.saveCart(cart);
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    const buttons = [...document.querySelectorAll(".bag-btn")];
                    buttons.forEach(button => {
                        if (parseInt(button.dataset.id) === id) {
                            button.disabled = false;
                            button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
                        }
                    });
                }
            }
        });
    }
    clearCart() {
        // console.log(this);
        cart = [];
        this.setCartValues(cart);
        Storage.saveCart(cart);
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttons.forEach(button => {
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
        });
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
}

class Storage {
    static saveToys(toys) {
        localStorage.setItem("toys", JSON.stringify(toys));
    }
    static getToy(id) {
        let toys = JSON.parse(localStorage.getItem("toys"));
        return toys.find(toy => toy.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) :
            [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const uis = new UIS();
    const toys = new Toys();
    uis.setupAPP();

    // get all toys
    toys
        .getToys()
        .then(toys => {
            uis.displayToys(toys);
            Storage.saveToys(toys);
        })
        .then(() => {
            uis.getBagButtons();
            uis.cartLogic();
        });
});