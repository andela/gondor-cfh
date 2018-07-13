import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const tokens = {
  goodToken: `${jwt.sign({
    id: '61bb8f8d16623818c391',
    email: 'test@test.com',
    username: 'myName006',
  }, process.env.SECRET, { expiresIn: '48h' })}`,
  fakeToken: `${jwt.sign({
    id: '61bb8f8d16623818c391',
    email: 'fake@test.com',
    username: 'myFakeName006',
  }, process.env.SECRET, { expiresIn: '48h' })}`,
  badToken: `${jwt.sign({
    id: '61bb8f8d16623818c391',
    email: 'fake@test.com',
    username: 'myFakeName006',
  }, 'fakesecret', { expiresIn: '48h' })}`,
  expiredToken: `${jwt.sign({
    id: '61bb8f8d16623818c391',
    email: 'fake@test.com',
    username: 'myFakeName006',
  }, process.env.SECRET, { expiresIn: '-1h' })}`
};

/* eslint-disable */
export const users = [{
  _id: '5b3e0fbabec49c7ee811773b',
  email: 'test1@test.com',
  hashedPassword: '$2a$10$C2bZtreqBrVb0Ie6FQqMSu1gz7rQvyPURzrpDErXAuqfeoMQf3nCy',
  name: 'myname004',
  username: 'test',
  donations: [],
  profileImage: 'https://res.cloudinary.com/defxlxmvc/image/upload/v1530704423/profileImage.png',
  __v: 0,
  gamesWon: 1
},
{
  _id: '5b3e0fbabea49c7ee811773b',
  email: 'test2@test.com',
  hashedPassword: '$2a$10$C2bZtreqBrVb0Ie6FQaMSu1gz7rQvyPURzrpDErXAuqfeoMQf3nCy',
  name: 'myname008',
  username: 'test2',
  donations: [],
  profileImage: 'https://res.cloudinary.com/defxlxmvc/image/upload/v1530704423/profileImage.png',
  __v: 0,
  gamesWon: 5
},
{
  _id: '5b3e0fbabeb49c7ee811773b',
  email: 'test4@test.com',
  hashedPassword: '$2a$10$C2bZtreqBrVb0Ie6FQaMSu1gz7rQvyPURzrpDErXAuqfeoMQf3nCy',
  name: 'myname010',
  username: 'test3',
  donations: [],
  profileImage: 'https://res.cloudinary.com/defxlxmvc/image/upload/v1530704423/profileImage.png',
  __v: 0,
  gamesWon: 3
}];

export const games = [{
  _id: '5b3e284eb7f9946a637b9932',
  gameId: 3245,
  winner: 'test1',
  players: ['test', 'test2', 'myName006'],
  rounds: 5,
  datePlayed: '2018-07-10T13:59:56.064Z'
},
{
  _id: '5b3e284eb7f9946b637b9932',
  gameId: 3246,
  winner: 'test4',
  players: ['test', 'test2', 'myName006'],
  rounds: 8,
  datePlayed: '2018-07-10T13:59:57.064Z'
}];

export default { tokens };
