let express = require("express");

let app = express();

let path = require("path");

const port = 5000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use('/images', express.static('images'));
app.use(express.json());

const knex = require("knex") ({
    client : "pg",
    connection : {
        host : 'database-1.cicrssmeudka.us-east-1.rds.amazonaws.com',
        user : "postgres",
        password : "th3b3stb3ars!",
        database : "postgres",
        port : 5432,
        ssl: {
            rejectUnauthorized: false,
        }
    }
})

app.get('/', (req,res) => {
    res.render('Homepage');
});

app.get('/getContact', (req,res) =>{
    res.render('contact');
});

app.get('/getLogin', (req, res) => {
    res.render('Login_Page');
});

app.get('/getAbout', (req,res) => {
    res.render('about');
});

app.get('/getHome', (req,res) => {
    res.render('Homepage');
});

app.get('/getShopping', (req, res) => {
    res.render('shopping')
})

app.get("/account", (req, res) =>
    {
        knex.select().from('Users').then( users => {
            console.log('Query Returned');
            res.render("account", { myusers: users });
        }).catch(err => {
            console.log(err);
            res.status(500).json({err});
        });
    });

app.get('/editAccount/:UserID', (req, res) => {
    knex.select().from('Users').where('UserID', parseInt(req.params.UserID)).then(user => {
        res.render('editAccount', {user: user})
    })
});

app.post('/editAccount', (req, res) => {
    knex('Users').where('UserID', parseInt(req.body.UserID)).update({
        UserFirstName: req.body.UserFirstName,
        UserLastName: req.body.UserLastName,
        UserPhoneNumber: req.body.UserPhoneNumber,
        UserEmail: req.body.UserEmail,
        UserType: req.body.UserType,
        Username: req.body.Username,
        Password: req.body.Password
    }).then(myusers => {
        res.redirect('/');
    });
});

app.post('/checkPassword', async (req, res) => {
    let username = req.body.Username;
    let password = req.body.Password;
    console.log(username, password)
    try {
      // Query the database for the user
      const user = await knex('Users')
        .where('Username', username) // Compare both username and plaintext password directly
        .first();
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid username' });
      }

      const isPasswordValid = user.Password === password;

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
  
      // Render the specific page if credentials are valid
      return res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
  });

app.get('/addAccount', (req, res) => {
    res.render('addAccount', {});
})

app.get('/success', (req, res) => {
    res.render('success');
})

app.post('/addAccount', (req,res) => {
    knex('Users').insert(req.body).then(myusers =>{
        res.redirect('/');
    })
});

app.post('/deleteAccount/:UserID', (req,res) => {
    knex('Users').where('UserID', req.params.UserID).del().then(myusers => {
        res.redirect('/');
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
});

app.listen(port, () => console.log('Listening...'))