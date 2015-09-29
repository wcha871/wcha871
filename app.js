/** 
2  * webserver-db-app.js 
3  *  
4  * @version 1.0 
5  *  
6  * DESCRIPTION: 
7  * a "HELLO WORLD" server-side application to demonstrate running a node  
8  * Webserver and a mongo DB on separate instances on AWS EC2. 
9  * Uses the Express and Mongoose node packages.  
10  *  
11  *  
12  * @throws none 
13  * @see nodejs.org 
14  * @see express.org 
15  * @see mongoosejs.com 
16  *  
17  * @author Ceeb 
18  * (C) 2013 Fatkahawai 
19  */ 
20 
 
21 var http      = require('http'); 
22 var mongoose  = require('mongoose'); 
23 var express   = require('express'); 
24 
 
25 var app       = express(); 
26 
 
27 var config = { 
28       "USER"     : "",                  // if your database has user/pwd defined 
29       "PASS"     : "", 
30       "HOST"     : "ec2-54-252-31-96.ap-southeast-2.compute.amazonaws.com",  // the domain name of our MongoDB EC2 instance 
31       "PORT"     : "27017",             // this is the default port mongoDB is listening for incoming queries 
32       "DATABASE" : "my_example"         // the name of your database on that instance 
33     }; 
34 
 
35 var dbPath  = "mongodb://" + config.USER + ":" + 
36     config.PASS + "@"+ 
37     config.HOST + ":"+ 
38     config.PORT + "/"+ 
39     config.DATABASE; 
40 
 
41 var standardGreeting = 'Hello World!'; 
42 
 
43 var db;              // our MongoDb database 
44 
 
45 var greetingSchema;  // our mongoose Schema 
46 var Greeting;        // our mongoose Model 
47 
 
48 // create our schema 
49 greetingSchema = mongoose.Schema({ 
50   sentence: String 
51 }); 
52 // create our model using this schema 
53 Greeting = mongoose.model('Greeting', greetingSchema); 
54 
 
55 // ------------------------------------------------------------------------ 
56 // Connect to our Mongo Database hosted on another server 
57 // 
58 console.log('\nattempting to connect to remote MongoDB instance on another EC2 server '+config.HOST); 
59 
 
60 if ( !(db = mongoose.connect(dbPath)) ) 
61   console.log('Unable to connect to MongoDB at '+dbPath); 
62 else  
63   console.log('connecting to MongoDB at '+dbPath); 
64 
 
65 // connection failed event handler 
66 mongoose.connection.on('error', function(err){ 
67   console.log('database connect error '+err); 
68 }); // mongoose.connection.on() 
69 
 
70 // connection successful event handler: 
71 // check if the Db already contains a greeting. if not, create one and save it to the Db 
72 mongoose.connection.once('open', function() { 
73   var greeting; 
74    
75   console.log('database '+config.DATABASE+' is now open on '+config.HOST ); 
76    
77   // search if a greeting has already been saved in our db 
78   Greeting.find( function(err, greetings){ 
79     if( !err && greetings ){ // at least one greeting record already exists in our db. we can use that 
80       console.log(greetings.length+' greetings already exist in DB' ); 
81     } 
82     else { // no records found 
83       console.log('no greetings in DB yet, creating one' ); 
84 
 
85       greeting = new Greeting({ sentence: standardGreeting }); 
86       greeting.save(function (err, greetingsav) { 
87         if (err){ // TODO handle the error 
88           console('couldnt save a greeting to the Db'); 
89         } 
90         else{ 
91           console.log('new greeting '+greeting.sentence+' was succesfully saved to Db' ); 
92 
 
93           Greeting.find( function(err, greetings){ 
94             if( greetings ) 
95               console.log('checked after save: found '+greetings.length+' greetings in DB' ); 
96           }); // Greeting.find() 
97         } // else 
98       }); // greeting.save() 
99     } // if no records 
100   }); // Greeting.find() 
101 
 
102    
103 }); // mongoose.connection.once() 
104 
 
105 // ------------------------------------------------------------------------ 
106 // set up Express routes to handle incoming requests 
107 // 
108 // Express route for all incoming requests 
109 app.get('/', function(req, res){ 
110   var responseText = ''; 
111 
 
112   console.log('received client request'); 
113   if( !Greeting ) 
114     console.log('Database not ready'); 
115    
116   // look up all greetings in our DB 
117   Greeting.find(function (err, greetings) { 
118     if (err) { 
119       console.log('couldnt find a greeting in DB. error '+err); 
120       next(err); 
121     } 
122     else { 
123       if(greetings){ 
124         console.log('found '+greetings.length+' greetings in DB'); 
125         // send newest greeting  
126         responseText = greetings[0].sentence; 
127       } 
128       console.log('sending greeting to client: '+responseText); 
129       res.send(responseText); 
130     } 
131   }); 
132 }); // apt.get() 
133 
 
134 // 
135 // Express route to handle errors 
136 // 
137 app.use(function(err, req, res, next){ 
138   if (req.xhr) { 
139     res.send(500, 'Something went wrong!'); 
140   } else { 
141     next(err); 
142   } 
143 }); // apt.use() 
144 
 
145 // ------------------------------------------------------------------------ 
146 // Start Express Webserver 
147 // 
148 console.log('starting the Express (NodeJS) Web server'); 
149 app.listen(8080); 
150 console.log('Webserver is listening on port 8080'); 
