import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';

const Restaurant = () => {
  let initRestaurant = {
    _id: 0,
    name: "",
    city: "",
    location_id: 0,
    city_id: 0,
    locality: "",
    thumb: [],
    aggregate_rating: 0,
    rating_text: "",
    min_price: 0,
    contact_number: "",
    cuisine_id: [],
    cuisine: [],
    image: "",
    mealtype_id: 0,
  };

  let [orderUser, setOrderUser] = useState({
    username: "Sachin Jaiswal",
    email: "sachin.jaiswasl@gmail.com",
    address: "Winnipeg",
    mobile: "4313356478",
  });
  let [restaurantDetails, setRestaurantDetails] = useState({ ...initRestaurant });
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  let [toggle, setToggle] = useState(true);
  let [totalPrice, setTotalPrice] = useState(0);
  const { id } = useParams();

  const getrestaurant = async () => {
    const Url = `http://localhost:3001/api/get-restaurant-details-by-id/${id}`;
    const response = await fetch(Url);
    const data = await response.json();
    setRestaurantDetails({ ...data.result[0] });
  };

  const getMenuItemsList = async () => {
    const Url = `http://localhost:3001/api/get-menu-items-by-restaurant-id/${id}`;
    const response = await fetch(Url);
    const data = await response.json();
    setRestaurantMenu(data.result);
  };

  let manageIncQty = (index) => {
    let _restaurantMenu = [...restaurantMenu];
    _restaurantMenu[index].qty += 1;
    let newTotal = totalPrice + _restaurantMenu[index].price;
    setTotalPrice(newTotal);
    setRestaurantMenu(_restaurantMenu);
  };

  let manageDecQty = (index) => {
    let _restaurantMenu = [...restaurantMenu];
    _restaurantMenu[index].qty -= 1;
    let newTotal = totalPrice - _restaurantMenu[index].price;
    setTotalPrice(newTotal);
    setRestaurantMenu(_restaurantMenu);
  };

  let loadScript = async () => {
    let script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
    return true;
  };

  const makePayment = async () => {
    await loadScript();

    const response = await fetch('http://localhost:3001/api/createorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalPrice }),
    });
    let data = await response.json();
    let { order } = data;

    var options = {
      key: "rzp_test_RB0WElnRLezVJ5",
      amount: order.amount,
      currency: "INR",
      name: "Zomato clone",
      description: "Test Transaction",
      image: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
      order_id: order.id,
      handler: async (response) => {
        let userOrders = restaurantMenu.filter((menu) => menu.qty > 0);
        let sendData = {
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id,
          signature: response.razorpay_signature,
          order_list: userOrders,
          total: totalPrice,
          user_email: orderUser.email,
          mobile: orderUser.mobile,
          username: orderUser.username,
          address: orderUser.address,
        };
        const verifyresponse = await fetch('http://localhost:3001/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sendData),
        });
        let data = await verifyresponse.json();
        if (data.status === true) {
          alert("Payment done successfully");
          window.location.assign("/");
        } else {
          alert("Payment Fail, Try Again");
        }
      },
      prefill: {
        name: orderUser.username,
        email: orderUser.email,
        contact: orderUser.mobile,
      },
      notes: { "address": "Razorpay Corporate Office" },
      theme: { "color": "#3399cc" }
    };

    try {
      var rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      alert("Unable to load try again");
    }
  };

  useEffect(() => {
    getrestaurant();
    getMenuItemsList();
  }, [id]);

  return (
    <>
      <div className="row bg-danger justify-content-center">
        <Header />
      </div>

      {/* Modal user info */}
      <div className="modal fade" id="modalAccountId" aria-hidden="true" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content p-3">
            <div className="modal-header">
              <h1 className="modal-title fs-5">User Details</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">User Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={orderUser.username}
                  onChange={(e) => setOrderUser({ ...orderUser, username: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={orderUser.email}
                  onChange={(e) => setOrderUser({ ...orderUser, email: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  value={orderUser.address}
                  onChange={(e) => setOrderUser({ ...orderUser, address: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary" data-bs-target="#restMenuModal" data-bs-toggle="modal">
                Back To Menu
              </button>
              <button className="btn btn-success" onClick={makePayment}>
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Other UI ... keep your modals, restaurant info, and rest of JSX same */}
    </>
  );
};

export default Restaurant;
