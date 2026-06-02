const data = {
  name: 'Alice',
  age: undefined,
  greet: () => 'hello'
};

const json = JSON.stringify(data);
console.log(json);

const back = JSON.parse(json);
console.log(back.name);
console.log(back.age);