import mongoose from 'mongoose';

const connect = async () => {
  if (
    mongoose.connections.length > 0 &&
    mongoose.connections[0].readyState === 1
  ) {
    console.log('Already connected');
    return;
  } else {
    await mongoose.disconnect();
  }

  try {
    mongoose.set('debug', false);
    const db = await mongoose.connect(
      process.env.NEXT_PUBLIC_DB_CONNECTION_URI as string
    );

    if (db.connections[0].readyState === 1) {
      console.log('new connection established');
      return db.connections[0];
    }
  } catch (e) {
    console.log({ dberror: (e as Error).message });
  }
};

const disconnect = async () => {
  await mongoose.disconnect();
  console.log('disconnected');
};

const dbUtils = { connect, disconnect };

export default dbUtils;
