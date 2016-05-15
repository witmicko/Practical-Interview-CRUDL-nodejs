Practical Interview
--------------------------

[![Build Status](https://travis-ci.com/witmicko/Practical-Interview-CRUDL-nodejs.svg?token=BNqwsHbtzG5ZjVLVo7mr&branch=master)](https://travis-ci.com/witmicko/Practical-Interview-CRUDL-nodejs)

My first pure RESTfull app in node.js.

Swagger uses 30day JWT token set as default to save some hassle. Use [/authenticate](http://mo-practical-interview.herokuapp.com/#!/Users/for_the_URL_0_1_2_3_4_5_6) example to generate new token.


Features Implemented:
--------------
- Create: user validation, duplicates checks.
- Read: get user by id
- Update: update user, check that username, email and pps didn't change.
- Delete: delete user by id
- List: list all users
- Search: search by email, username or pps. requires exact field match.

Development features
--------
- Swagger UI: documentation, interaction.
- Travis CI, Heroku deploy hooks: [mo-practical-interview.herokuapp.com](http://mo-practical-interview.herokuapp.com/#/)
- API tests
- logger: console and file.

Tools used
-----
- node
- express 4
- mocha
- winston
- grunt
- travis ci
- swagger
- mongodb native driver
- jsonwebtoken
