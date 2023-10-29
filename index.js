"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var https_1 = __importDefault(require("https"));
var express_openid_connect_1 = require("express-openid-connect");
var pg_1 = require("pg");
var dotenv = __importStar(require("dotenv"));
dotenv.config();
var externalUrl = process.env.RENDER_EXTERNAL_URL;
var app = (0, express_1.default)();
var port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8000;
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use(express_1.default.urlencoded({ extended: false }));
var config = {
    authRequired: false,
    idpLogout: true,
    secret: process.env.SECRET,
    baseURL: externalUrl || "https://localhost:".concat(port),
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: 'https://dev-h2nq1p48ta3mwij5.us.auth0.com',
    clientSecret: process.env.CLIENT_SECRET,
    authorizationParams: {
        response_type: 'code',
    },
};
app.use((0, express_openid_connect_1.auth)(config));
var pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'projekt_baza',
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: true
});
app.get('/prikazsvihnatjecanja', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, rows, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query('SELECT * FROM natjecanje')];
            case 1:
                result = _a.sent();
                rows = result.rows;
                res.render('natjecanja', { data: rows });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.error('Error executing query', err_1);
                res.send('Error');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/', function (req, res) {
    res.render('index');
});
app.get('/loginNovi', (0, express_openid_connect_1.requiresAuth)(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, result, rows, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = JSON.stringify(req.oidc.user);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, pool.query('SELECT * FROM natjecanje')];
            case 2:
                result = _a.sent();
                rows = result.rows;
                res.render('login', { data: rows, user: user });
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.error('Error executing query', err_2);
                res.send('Error');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/dodajNatjecanje', function (req, res) {
    res.render('dodavanjeNatjecanja');
});
app.get('/raspored/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var natjecanjeId, result, result1, result2, result3, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                natjecanjeId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, pool.query("SELECT * FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '".concat(natjecanjeId, "' ORDER BY raspored.id ASC"))];
            case 2:
                result = _a.sent();
                return [4 /*yield*/, pool.query("SELECT ime FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '".concat(natjecanjeId, "'"))];
            case 3:
                result1 = _a.sent();
                return [4 /*yield*/, pool.query("SELECT natjecatelji FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '".concat(natjecanjeId, "'"))];
            case 4:
                result2 = _a.sent();
                return [4 /*yield*/, pool.query("SELECT bodovanje FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '".concat(natjecanjeId, "'"))];
            case 5:
                result3 = _a.sent();
                //console.log(result)
                res.render('rasporedNatjecanja', { data: result.rows, ime: result1.rows[0], natjecatelji: result2.rows[0], bodovanje: result3.rows[0] });
                return [3 /*break*/, 7];
            case 6:
                err_3 = _a.sent();
                console.error('Error executing query', err_3);
                res.send('Error');
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.get('/urediNatjecanje/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var natjecanjeId, result, result1, result2, result3, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                natjecanjeId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, pool.query("SELECT * FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '".concat(natjecanjeId, "'ORDER BY raspored.id ASC"))];
            case 2:
                result = _a.sent();
                return [4 /*yield*/, pool.query("SELECT ime FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '".concat(natjecanjeId, "'"))];
            case 3:
                result1 = _a.sent();
                return [4 /*yield*/, pool.query("SELECT natjecatelji FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '".concat(natjecanjeId, "'"))];
            case 4:
                result2 = _a.sent();
                return [4 /*yield*/, pool.query("SELECT bodovanje FROM natjecanje JOIN raspored ON natjecanje.id = raspored.natjecanje_id WHERE natjecanje.id = '".concat(natjecanjeId, "'"))];
            case 5:
                result3 = _a.sent();
                //console.log(result)
                res.render('urediNatjecanje', { data: result.rows, ime: result1.rows[0], natjecatelji: result2.rows[0], bodovanje: result3.rows[0] });
                return [3 /*break*/, 7];
            case 6:
                err_4 = _a.sent();
                console.error('Error executing query', err_4);
                res.send('Error');
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.get('/uredivanjeRezultata/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rasporedId, result, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                rasporedId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, pool.query("SELECT * FROM raspored WHERE id = '".concat(rasporedId, "'"))];
            case 2:
                result = _a.sent();
                //console.log(result.rows[0])
                res.render('uredivanjeRezultata', { data: result.rows[0] });
                return [3 /*break*/, 4];
            case 3:
                err_5 = _a.sent();
                console.error('Error executing query', err_5);
                res.send('Error');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/submit', function (req, res) {
    var idKojiMiTreba;
    var _a = req.body, competitionName = _a.competitionName, competitors = _a.competitors, scoringSystem = _a.scoringSystem;
    var competitorsArray = competitors.split(/[;\r\n]+/);
    if (competitorsArray.lenth > 8 || competitorsArray.length < 4) {
        return res.status(400).send('Broj natjecatelja mora bit između 4 i 8.');
    }
    //console.log(competitorsArray)
    //console.log(competitorsArray.length)
    var insertQuery = "INSERT INTO natjecanje (ime, natjecatelji, bodovanje) VALUES ('".concat(competitionName, "', '").concat(competitorsArray, "', '").concat(scoringSystem, "')");
    pool.query(insertQuery, function (err, result) {
        if (err)
            throw err;
        console.log('Podaci natjecanja uspješno spremljeni u bazu.');
        pool.query("SELECT id FROM natjecanje WHERE ime = '".concat(competitionName, "'"), function (error, results) {
            if (error) {
                throw error;
            }
            //console.log('ID iz baze podataka:', results.rows[0].id);
            idKojiMiTreba = results.rows[0].id;
            //console.log('IdKojiMi1: ', idKojiMiTreba)
            var schedule = generateSchedule(competitorsArray);
            for (var _i = 0, schedule_1 = schedule; _i < schedule_1.length; _i++) {
                var match = schedule_1[_i];
                var team1 = match.team1, team2 = match.team2;
                var query = {
                    text: 'INSERT INTO raspored (natjecanje_id, tim1, tim2) VALUES ($1, $2, $3)',
                    values: [idKojiMiTreba, team1, team2],
                };
                pool.query(query, function (error, results) {
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
app.post('/editiraj/:id', function (req, res) {
    var idKojiMiTreba1 = req.params.id;
    var rezultatObjekt = req.body;
    var noviRezultat = rezultatObjekt.noviRezultat;
    //console.log(noviRezultat)
    var query = 'UPDATE raspored SET rezultat = $1 WHERE id = $2';
    pool.query(query, [noviRezultat, idKojiMiTreba1], function (error, results) {
        if (error) {
            throw error;
        }
        var query1 = 'SELECT natjecanje_id FROM raspored WHERE id = $1';
        pool.query(query1, [idKojiMiTreba1], function (error, result1) {
            if (error) {
                throw error;
            }
            //console.log(result1.rows[0])
            res.render('uspjeh1', { data: result1.rows[0] });
            console.log('Rezultat je uspješno ažuriran.');
        });
    });
});
function generateSchedule(teams) {
    var schedule = [];
    for (var i = 0; i < teams.length - 1; i++) {
        for (var j = i + 1; j < teams.length; j++) {
            var match = {
                team1: teams[i],
                team2: teams[j],
            };
            schedule.push(match);
        }
    }
    return schedule;
}
app.get('/prikazstanja', function (req, res) {
    res.render('prikazstanja');
});
if (externalUrl) {
    var hostname_1 = '0.0.0.0'; //ne 127.0.0.1   
    app.listen(port, hostname_1, function () {
        console.log("Server locally running at http://".concat(hostname_1, ":").concat(port, "/ and \n    from outside on ").concat(externalUrl));
    });
}
else {
    https_1.default.createServer({
        key: fs_1.default.readFileSync('server.key'),
        cert: fs_1.default.readFileSync('server.cert')
    }, app)
        .listen(port, function () {
        console.log("Server running at https://localhost:".concat(port, "/"));
    });
}
/**
 * Server Activation
 */
/**app.listen(port, () => {
 *   console.log(`Listening to requests on http://localhost:${port}`);
  });*/ 
