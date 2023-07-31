// const bcrypt = require("bcrypt")
// const saltRounds = 10
// const password = "Admin@123"

// bcrypt
//   .genSalt(saltRounds)
//   .then(salt => {
//     console.log('Salt: ', salt)
//     return bcrypt.hash(password, salt)
//   })
//   .then(hash => {
//     console.log('Hash: ', hash)
//   })
//   .catch(err => console.error(err.message))
// const bcrypt = require("bcrypt")
// console.log('====================================');
// console.log(bcrypt.compare('$2b$10$OBg4MWEvjC3qwdJxfIFS7uCDXTRKi2Z1YPdTXnGfD2OFy7cC4rVEW', 'adklfn'));
// console.log('====================================');

const verifyLogin = async () => {
    const res = await fetch('http://localhost:5000/user/verify', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + 'dlkfncrzkjn'
        }
    });
    const data = await res.json();
    console.log(data);
}

verifyLogin();