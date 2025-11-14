const users = [];

function findUserByEmail(email) {
  return users.find(user => user.email === email);
}

function addUser({ username, email, password }) {
  const newUser = { id: users.length + 1, username, email, password };
  users.push(newUser);
  return newUser;
}

module.exports = { users, findUserByEmail, addUser };
