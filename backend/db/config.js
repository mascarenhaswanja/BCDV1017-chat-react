const mongoose = require("mongoose");

mongoose.set('useFindAndModify', false);

const MONGOURI = "MONGODB";

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(MONGOURI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log("Connected to DB FullChat !!");
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = InitiateMongoServer;
