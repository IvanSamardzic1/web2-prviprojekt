import express from "express";
import path from "path";
import fs from 'fs';
import https from 'https';
import { auth, requiresAuth } from 'express-openid-connect'; 
import { Pool } from 'pg' 
import dotenv from 'dotenv';
dotenv.config();

const externalUrl = process.env.RENDER_EXTERNAL_URL; 


const app = express();

const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8000;
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const config = { 
  authRequired : false,
  idpLogout : true, //login not only from the app, but also from identity provider
  secret: process.env.SECRET,
  baseURL: externalUrl || `https://localhost:${port}`, 
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: 'https://dev-h2nq1p48ta3mwij5.us.auth0.com',
  clientSecret: process.env.CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code' ,
    //scope: "openid profile email"   
   },
};

app.use(auth(config));


const pool = new Pool({   
    user: process.env.DB_USER,   
    host: process.env.DB_HOST,   
    database: 'projekt_baza',   
    password: process.env.DB_PASSWORD,   
    port: 5432,   
    ssl : true 
  })  

app.get('/prikazsvihnatjecanja', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM natjecanje');
    const rows = result.rows;
    res.render('natjecanja', { data: rows });
  } catch (err) {
    console.error('Error executing query', err);
    res.send('Error');
  }
});

app.get('/', (req, res) => {
  res.render('index');
})



app.get('/loginNovi', requiresAuth(), async (req, res)=> {       
  const user = JSON.stringify(req.oidc.user);      
  /*res.render('login', {user}); */
  try {
    const result = await pool.query('SELECT * FROM natjecanje');
    const rows = result.rows;
    res.render('login', { data: rows, user });
  } catch (err) {
    console.error('Error executing query', err);
    res.send('Error');
  }
});

app.get('/dodajNatjecanje', (req, res) => {
  res.render('dodavanjeNatjecanja');
})

app.get('/raspored/:id', async (req, res) => {
  const natjecanjeId = req.params.id;

  try {
    const result = await pool.query(`SELECT * FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '${natjecanjeId}' ORDER BY raspored.id ASC`);
    const result1 = await pool.query(`SELECT ime FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '${natjecanjeId}'`);
    const result2 = await pool.query(`SELECT natjecatelji FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '${natjecanjeId}'`);
    const result3 = await pool.query(`SELECT bodovanje FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '${natjecanjeId}'`);
    //console.log(result)

    res.render('rasporedNatjecanja', { data: result.rows, ime: result1.rows[0], natjecatelji: result2.rows[0], bodovanje: result3.rows[0] });
  } catch (err) {
    console.error('Error executing query', err);
    res.send('Error');
  }

})

app.get('/urediNatjecanje/:id', async (req, res) => {
  const natjecanjeId = req.params.id;

  try {
    const result = await pool.query(`SELECT * FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '${natjecanjeId}'ORDER BY raspored.id ASC`);
    const result1 = await pool.query(`SELECT ime FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '${natjecanjeId}'`);
    const result2 = await pool.query(`SELECT natjecatelji FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '${natjecanjeId}'`);
    const result3 = await pool.query(`SELECT bodovanje FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '${natjecanjeId}'`);
    //console.log(result)

    res.render('urediNatjecanje', { data: result.rows, ime: result1.rows[0], natjecatelji: result2.rows[0], bodovanje: result3.rows[0] });
  } catch (err) {
    console.error('Error executing query', err);
    res.send('Error');
  }

})

app.get('/uredivanjeRezultata/:id', async (req, res) => {
  const rasporedId = req.params.id;

  try {
    const result = await pool.query(`SELECT * FROM raspored WHERE id = '${rasporedId}'`);
 
    //console.log(result.rows[0])

    res.render('uredivanjeRezultata', { data: result.rows[0]});
  } catch (err) {
    console.error('Error executing query', err);
    res.send('Error');
  }

})


app.post('/submit', (req, res) => {
  var idKojiMiTreba: number;
  const { competitionName, competitors, scoringSystem } = req.body;
  const competitorsArray = competitors.split(/[;\r\n]+/)
  if (competitorsArray.lenth > 8 || competitorsArray.length < 4) {
    return res.status(400).send('Broj natjecatelja mora bit između 4 i 8.')
  }
  //console.log(competitorsArray)
  //console.log(competitorsArray.length)
  
  const insertQuery = `INSERT INTO natjecanje (ime, natjecatelji, bodovanje) VALUES ('${competitionName}', '${competitorsArray}', '${scoringSystem}')`;
  pool.query(insertQuery, (err, result) => {
      if (err) throw err;
      console.log('Podaci natjecanja uspješno spremljeni u bazu.');
      pool.query(`SELECT id FROM natjecanje WHERE ime = '${competitionName}'`, (error, results) => {
        if (error) {
          throw error;
        }
      //console.log('ID iz baze podataka:', results.rows[0].id);
      idKojiMiTreba = results.rows[0].id;
      //console.log('IdKojiMi1: ', idKojiMiTreba)
      const schedule = generateSchedule(competitorsArray);
      for (const match of schedule) {
        const { team1, team2 } = match;
        const query = {
          text: 'INSERT INTO raspored (natjecanje_id, tim1, tim2) VALUES ($1, $2, $3)',
          values: [idKojiMiTreba, team1, team2],
        };
      
        pool.query(query, (error, results) => {
          if (error) {
            throw error;
          }
          console.log('Raspored je uspješno spremljen u bazu.');
        });
      }

      });
      res.render('uspjeh');
  });
});


app.post('/editiraj/:id', (req, res) => {
  const idKojiMiTreba1 = req.params.id;
  const rezultatObjekt = req.body
  const noviRezultat = rezultatObjekt.noviRezultat

  //console.log(noviRezultat)

  const query = 'UPDATE raspored SET rezultat = $1 WHERE id = $2';
  pool.query(query, [noviRezultat, idKojiMiTreba1], (error, results) => {
    if (error) {
      throw error;
    }
    const query1 = 'SELECT natjecanje_id FROM raspored WHERE id = $1';
    pool.query(query1, [idKojiMiTreba1], (error, result1) => {
      if(error) {
        throw error;
      }
      //console.log(result1.rows[0])
      res.render('uspjeh1', { data: result1.rows[0]})
      console.log('Rezultat je uspješno ažuriran.');
    })
  });
});


function generateSchedule(teams: string[]): { team1: string; team2: string }[] {
  const schedule: { team1: string; team2: string }[] = [];

  for (let i = 0; i < teams.length - 1; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const match = {
        team1: teams[i],
        team2: teams[j],
      };
      schedule.push(match);
    }
  }

  return schedule;
}

app.get('/prikazstanja', (req, res) => {
  res.render('prikazstanja');
})


if (externalUrl) {   
  const hostname = '0.0.0.0'; //ne 127.0.0.1   
  app.listen(port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${port}/ and 
    from outside on ${externalUrl}`);   
  }); 
} 
else {   
  https.createServer({     
    key: fs.readFileSync('server.key'),     
    cert: fs.readFileSync('server.cert')   
  }, app)
  .listen(port, function () {
    console.log(`Server running at https://localhost:${port}/`);
  }); 
} 


/**
 * Server Activation
 */

/**app.listen(port, () => {
 *   console.log(`Listening to requests on http://localhost:${port}`);
  });*/