const faker = require("faker");

module.exports = Array.from({ length: 10 }, () => ({
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  completed: false,
}));
