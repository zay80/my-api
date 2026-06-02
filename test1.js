// Topic 1

const orders = [
  { id: 1, product: 'Laptop', price: 1200, delivered: true },
  { id: 2, product: 'Phone', price: 800, delivered: false },
  { id: 3, product: 'Tablet', price: 400, delivered: true },
  { id: 4, product: 'Watch', price: 200, delivered: false },
];

const names = orders.map(order => order.product);
console.log(names);

const delivered = orders.filter(order => order.delivered);
console.log(delivered);

const price = orders.map(order => order.price);
const totalprice = price.reduce((accumulator, current) => {
    return accumulator + current;
},0);
console.log(totalprice);

const price2 = orders.reduce((acc,order) => acc+order.price, 0);
console.log(price2);

//Topic 2

const order = {
  id: 101,
  customer: {
    name: 'John',
    email: 'john@email.com'
  },
  items: ['Laptop', 'Mouse', 'Keyboard'],
  total: 1500,
  status: 'pending'
};

const {id, total} = order;

const {customer: {name}} = order;
console.log(name);

const {items: [first]} = order;
console.log(first);

const orderCopy = {...order, status: 'shipped'};
console.log(orderCopy.status);


function getUser(id) {
  return new Promise(resolve => {
    setTimeout(() => resolve({ id, name: 'Alice' }), 1000);
  });
}

function getOrders(userId) {
  return new Promise(resolve => {
    setTimeout(() => resolve([
      { orderId: 1, product: 'Laptop' },
      { orderId: 2, product: 'Phone' }
    ]), 1000);
  });
}



async function getUserWithOrders(id) {
  try {
    const [user, orders] = await Promise.all([
      getUser(id),
      getOrders(id)
    ]);
    return { user, orders };
  } catch (err) {
    console.log('Something went wrong:', err.message);
  }
}

// Test it
const result = await getUserWithOrders(1);
console.log(result);
// { user: { id: 1, name: 'Alice' }, orders: [{...}, {...}] }