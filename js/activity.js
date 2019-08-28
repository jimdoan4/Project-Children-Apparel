// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const activitiesDOM = document.querySelector(".activities-center");
let cart = [];



class Activities {
    async getActivities() {
        try {
            let result = await fetch("activities.json");
            let data = await result.json();

            let activities = data.items;
            activities = activities.map(item => {
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
            console.log(activities);

            return activities;
        } catch (error) {
            console.log(error);
        }
    }
}

// ui
class UISES {
    displayActivities(activities) {
        let result = "";
        activities.forEach(activity => {
            result += `
     <!-- single activity -->
          <article class="activity">
            <div class="img-container">
              <img
                src=${activity.image}
              
                class="activity-img"
              />
            
            </div>
            <h3>${activity.title}<br>$${activity.price}</h3>
            <button class="bag-btn" data-id=${activity.id}>
            <i class="fas fa-shopping-cart"></i>
            add to bag
          </button>
          </article>
          <!-- end of single product -->
     `;
        });
        activitiesDOM.innerHTML = result;
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
                        ...Storage.getActivity(id),
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
    static saveActivities(activities) {
        localStorage.setItem("activities", JSON.stringify(activities));
    }
    static getActivity(id) {
        let activities = JSON.parse(localStorage.getItem("activities"));
        return activities.find(activity => activity.id === id);
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
    const uises = new UISES();
    const activities = new Activities();
    uises.setupAPP();

    // get all Activities
    activities
        .getActivities()
        .then(activities => {
            uises.displayActivities(activities);
            Storage.saveActivities(activities);
        })
        .then(() => {
            uises.getBagButtons();
            uises.cartLogic();
        });
});