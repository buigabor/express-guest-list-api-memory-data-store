import bodyParser from 'body-parser';
import express from 'express';

const app = express();

app.use(bodyParser.json());

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  deadline?: string;
  attending: boolean;
  eventId: string;
};

type Event = {
  eventId: string;
  eventName: string;
  eventLocation: string;
  guestList: Guest[];
};

let id = 1;
let eventId = 1;

const guestList: Guest[] = [];
const eventList: Event[] = [];

// Enable CORS
app.use(function (_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS',
  );
  next();
});

// Get all guests
app.get('/event/:id/guest-list', function (_req, res) {
  const event = eventList.find(
    (currentEvent) => currentEvent.eventId === _req.params.id,
  );

  if (!event) {
    res
      .status(404)
      .json({ errors: [{ message: `Event ${_req.params.id} not found` }] });
    return;
  }

  res.json(event.guestList);
});

// Get all events

app.get('/event', function (_req, res) {
  res.json(eventList);
});

// New event

app.post('/event', function (req, res) {
  if (!req.body.eventName || !req.body.eventLocation) {
    res.status(400).json({
      errors: [
        {
          message:
            'Request body missing an eventName or eventLocation property',
        },
      ],
    });
    return;
  }

  if (Object.keys(req.body).length > 2) {
    res.status(400).json({
      errors: [
        {
          message:
            'Request body contains more than eventName and eventLocation',
        },
      ],
    });
    return;
  }

  const event = {
    eventId: String(eventId++),
    eventName: req.body.eventName,
    eventLocation: req.body.eventLocation,
    guestList: [],
  };

  eventList.push(event);

  res.json(event);
});

// Delete event

app.delete('/event/:eventId', function (req, res) {
  const event = eventList.find(
    (currentEvent) => currentEvent.eventId === String(req.params.eventId),
  );

  if (!event) {
    res
      .status(404)
      .json({ errors: [{ message: `Event ${req.params.eventId} not found` }] });
    return;
  }

  eventList.splice(eventList.indexOf(event), 1);
  res.json(event);
});

// New guest
app.post('/', function (req, res) {
  if (!req.body.firstName || !req.body.lastName) {
    res.status(400).json({
      errors: [
        { message: 'Request body missing a firstName or lastName property' },
      ],
    });
    return;
  }

  if (Object.keys(req.body).length > 3) {
    res.status(400).json({
      errors: [
        {
          message:
            'Request body contains more than firstName, lastName and deadline properties',
        },
      ],
    });
    return;
  }

  const guest = {
    id: String(id++),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    ...(req.body.deadline ? { deadline: req.body.deadline } : {}),
    attending: false,
    eventId: req.body.eventId,
  };

  eventList.forEach((event) => {
    if (event.eventId === req.body.eventId) {
      return event.guestList.push(guest);
    }
  });

  res.json(guest);
});

// Modify a single guest
app.patch('/event/:eventId/guest/:id', function (req, res) {
  const allowedKeys = ['firstName', 'lastName', 'deadline', 'attending'];
  const difference = Object.keys(req.body).filter(
    (key) => !allowedKeys.includes(key),
  );

  if (difference.length > 0) {
    res.status(400).json({
      errors: [
        {
          message: `Request body contains more than allowed properties (${allowedKeys.join(
            ', ',
          )}). The request also contains these extra keys that are not allowed: ${difference.join(
            ', ',
          )}`,
        },
      ],
    });
    return;
  }

  const event = eventList.find(
    (currentEvent) => currentEvent.eventId === req.params.eventId,
  );
  if (!event) {
    res
      .status(404)
      .json({ errors: [{ message: `Event ${req.params.eventId} not found` }] });
    return;
  }

  const guest = event.guestList.find(
    (currentGuest) => currentGuest.id === req.params.id,
  );

  if (!guest) {
    res
      .status(404)
      .json({ errors: [{ message: `Guest ${req.params.id} not found` }] });
    return;
  }

  if (req.body.firstName) guest.firstName = req.body.firstName;
  if (req.body.lastName) guest.lastName = req.body.lastName;
  if (req.body.deadline) guest.deadline = req.body.deadline;
  if ('attending' in req.body) guest.attending = req.body.attending;
  res.json(guest);
});

// Delete a single guest
app.delete('/event/:eventId/guest/:id', function (req, res) {
  const event = eventList.find(
    (currentEvent) => currentEvent.eventId === req.params.eventId,
  );
  if (!event) {
    res
      .status(404)
      .json({ errors: [{ message: `Event ${req.params.eventId} not found` }] });
    return;
  }

  const guest = event.guestList.find(
    (currentGuest) => currentGuest.id === req.params.id,
  );

  if (!guest) {
    res
      .status(404)
      .json({ errors: [{ message: `Guest ${req.params.id} not found` }] });
    return;
  }

  event.guestList.splice(event.guestList.indexOf(guest), 1);
  res.json(guest);
});

app.listen(process.env.PORT || 5000, () => {
  console.log('🚀 Guest list server started on http://localhost:5000');
});
