require( "dotenv" ).config();
const { MongoClient, ServerApiVersion } = require( 'mongodb' );
const express = require( 'express' );
const cors = require( 'cors' );
const port = process.env.PORT || 5000;
const app = express();


app.use( express.json() );
app.use( cors() );


const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.kldhy00.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient( uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 } );

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db( "doctors_portal" ).collection( "services" );
        const bookingCollection = client.db( "doctors_portal" ).collection( "booking" );

        app.get( '/service', async ( req, res ) => {
            const query = {};
            const cursor = serviceCollection.find( query );
            const services = await cursor.toArray();
            res.send( services );
        } );

        //Warning
        //This is not the proper way to query
        //After learning more about mongodb, use aggregate lookup, pipeline, group
        app.get( '/available', async ( req, res ) => {
            const date = req.query.date;

            //step-1: get all services
            const services = await serviceCollection.find().toArray();

            //step-2: get the booking of the day
            const query = { date: date };
            const bookings = await bookingCollection.find( query ).toArray();

            //step-3: for each service, find bookings for that service
            services.forEach( service => {
                const serviceBookings = bookings.filter( book => book.treatment === service.name );
                const bookedSlots = serviceBookings.map( book => book.slot );
                const available = service.slots.filter( slot => !bookedSlots.includes( slot ) );
                service.slots = available;
            } );

            res.send( services );
        } );

        /**
         *  API Naming Convention
         * app.get('/booking')//get all booking in the collection of by filter using query
         * app.get('/booking/:id')//get a special booking
         * app.post('/booking')//add a new booking
         * app.patch('/booking/:id')
         * app.delete('/booking/:id')
         */

        app.post( '/booking', async ( req, res ) => {
            const info = req.body;
            const query = { treatment: info.treatment, date: info.date, patient: info.patient };
            const exists = await bookingCollection.findOne( query );
            if ( exists ) {
                return res.send( { success: false, info: exists } );
            }
            const result = await bookingCollection.insertOne( info );
            return res.send( { success: true, result } );
        } );

        app.get( '/booking', async ( req, res ) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingCollection.find( query ).toArray();
            res.send( bookings );
        } );

    }
    finally {

    }

}
run().catch( console.dir );


app.get( '/', ( req, res ) => {
    res.send( 'Hello Jonogon' );
} );


app.listen( port, () => {
    console.log( 'Server is Running port: ', port );
} );