-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cinemas (
  cinemaid integer NOT NULL DEFAULT nextval('cinemas_cinemaid_seq'::regclass),
  cinemaname character varying NOT NULL,
  address character varying,
  city character varying,
  CONSTRAINT cinemas_pkey PRIMARY KEY (cinemaid)
);
CREATE TABLE public.countries (
  countryid integer NOT NULL DEFAULT nextval('countries_countryid_seq'::regclass),
  countryname character varying NOT NULL UNIQUE,
  CONSTRAINT countries_pkey PRIMARY KEY (countryid)
);
CREATE TABLE public.customers (
  customerid integer NOT NULL DEFAULT nextval('customers_customerid_seq'::regclass),
  fullname character varying,
  phone character varying,
  email character varying,
  user_id uuid,
  roleid integer DEFAULT 1,
  CONSTRAINT customers_pkey PRIMARY KEY (customerid),
  CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT customers_roleid_fkey FOREIGN KEY (roleid) REFERENCES public.roles(roleid)
);
CREATE TABLE public.genres (
  genreid integer NOT NULL DEFAULT nextval('genres_genreid_seq'::regclass),
  genrename character varying NOT NULL UNIQUE,
  CONSTRAINT genres_pkey PRIMARY KEY (genreid)
);
CREATE TABLE public.halls (
  hallid integer NOT NULL DEFAULT nextval('halls_hallid_seq'::regclass),
  cinemaid integer NOT NULL,
  hallname character varying NOT NULL,
  seatscount integer NOT NULL,
  CONSTRAINT halls_pkey PRIMARY KEY (hallid),
  CONSTRAINT halls_cinemaid_fkey FOREIGN KEY (cinemaid) REFERENCES public.cinemas(cinemaid)
);
CREATE TABLE public.moviegenres (
  movieid integer NOT NULL,
  genreid integer NOT NULL,
  CONSTRAINT moviegenres_pkey PRIMARY KEY (movieid, genreid),
  CONSTRAINT moviegenres_movieid_fkey FOREIGN KEY (movieid) REFERENCES public.movies(movieid),
  CONSTRAINT moviegenres_genreid_fkey FOREIGN KEY (genreid) REFERENCES public.genres(genreid)
);
CREATE TABLE public.moviepersons (
  movieid integer NOT NULL,
  personid integer NOT NULL,
  roletypeid integer NOT NULL,
  charactername character varying,
  CONSTRAINT moviepersons_pkey PRIMARY KEY (movieid, personid, roletypeid),
  CONSTRAINT moviepersons_movieid_fkey FOREIGN KEY (movieid) REFERENCES public.movies(movieid),
  CONSTRAINT moviepersons_personid_fkey FOREIGN KEY (personid) REFERENCES public.persons(personid),
  CONSTRAINT moviepersons_roletypeid_fkey FOREIGN KEY (roletypeid) REFERENCES public.roletypes(roletypeid)
);
CREATE TABLE public.movies (
  movieid integer NOT NULL DEFAULT nextval('movies_movieid_seq'::regclass),
  title character varying NOT NULL,
  originaltitle character varying,
  releaseyear integer,
  durationmin integer NOT NULL,
  agerating character varying,
  description text,
  studioid integer,
  countryid integer,
  poster_url text,
  CONSTRAINT movies_pkey PRIMARY KEY (movieid),
  CONSTRAINT movies_studioid_fkey FOREIGN KEY (studioid) REFERENCES public.studios(studioid),
  CONSTRAINT movies_countryid_fkey FOREIGN KEY (countryid) REFERENCES public.countries(countryid)
);
CREATE TABLE public.payment_cards (
  cardid integer NOT NULL DEFAULT nextval('payment_cards_cardid_seq'::regclass),
  customerid integer NOT NULL,
  card_number_last4 character varying NOT NULL,
  card_holder_name character varying NOT NULL,
  expiry_month integer NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year integer NOT NULL CHECK (expiry_year >= 2026),
  card_type character varying DEFAULT 'unknown'::character varying,
  is_default boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT payment_cards_pkey PRIMARY KEY (cardid),
  CONSTRAINT payment_cards_customerid_fkey FOREIGN KEY (customerid) REFERENCES public.customers(customerid)
);
CREATE TABLE public.persons (
  personid integer NOT NULL DEFAULT nextval('persons_personid_seq'::regclass),
  fullname character varying NOT NULL,
  birthdate date,
  countryid integer,
  CONSTRAINT persons_pkey PRIMARY KEY (personid),
  CONSTRAINT persons_countryid_fkey FOREIGN KEY (countryid) REFERENCES public.countries(countryid)
);
CREATE TABLE public.roles (
  roleid integer NOT NULL DEFAULT nextval('roles_roleid_seq'::regclass),
  rolename character varying NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (roleid)
);
CREATE TABLE public.roletypes (
  roletypeid integer NOT NULL DEFAULT nextval('roletypes_roletypeid_seq'::regclass),
  roletypename character varying NOT NULL UNIQUE,
  CONSTRAINT roletypes_pkey PRIMARY KEY (roletypeid)
);
CREATE TABLE public.seats (
  seatid integer NOT NULL DEFAULT nextval('seats_seatid_seq'::regclass),
  hallid integer NOT NULL,
  rownumber integer NOT NULL,
  seatnumber integer NOT NULL,
  CONSTRAINT seats_pkey PRIMARY KEY (seatid),
  CONSTRAINT seats_hallid_fkey FOREIGN KEY (hallid) REFERENCES public.halls(hallid)
);
CREATE TABLE public.sessions (
  sessionid integer NOT NULL DEFAULT nextval('sessions_sessionid_seq'::regclass),
  movieid integer NOT NULL,
  hallid integer NOT NULL,
  starttime timestamp without time zone NOT NULL,
  price numeric NOT NULL,
  CONSTRAINT sessions_pkey PRIMARY KEY (sessionid),
  CONSTRAINT sessions_movieid_fkey FOREIGN KEY (movieid) REFERENCES public.movies(movieid),
  CONSTRAINT sessions_hallid_fkey FOREIGN KEY (hallid) REFERENCES public.halls(hallid)
);
CREATE TABLE public.studios (
  studioid integer NOT NULL DEFAULT nextval('studios_studioid_seq'::regclass),
  studioname character varying NOT NULL UNIQUE,
  countryid integer,
  CONSTRAINT studios_pkey PRIMARY KEY (studioid),
  CONSTRAINT studios_countryid_fkey FOREIGN KEY (countryid) REFERENCES public.countries(countryid)
);
CREATE TABLE public.tickets (
  ticketid integer NOT NULL DEFAULT nextval('tickets_ticketid_seq'::regclass),
  sessionid integer NOT NULL,
  seatid integer NOT NULL,
  soldat timestamp without time zone NOT NULL DEFAULT now(),
  price numeric NOT NULL,
  CONSTRAINT tickets_pkey PRIMARY KEY (ticketid),
  CONSTRAINT tickets_sessionid_fkey FOREIGN KEY (sessionid) REFERENCES public.sessions(sessionid),
  CONSTRAINT tickets_seatid_fkey FOREIGN KEY (seatid) REFERENCES public.seats(seatid)
);
CREATE TABLE public.ticketsales (
  saleid integer NOT NULL DEFAULT nextval('ticketsales_saleid_seq'::regclass),
  ticketid integer NOT NULL,
  customerid integer,
  paymentmethod character varying,
  CONSTRAINT ticketsales_pkey PRIMARY KEY (saleid),
  CONSTRAINT ticketsales_ticketid_fkey FOREIGN KEY (ticketid) REFERENCES public.tickets(ticketid),
  CONSTRAINT ticketsales_customerid_fkey FOREIGN KEY (customerid) REFERENCES public.customers(customerid)
);