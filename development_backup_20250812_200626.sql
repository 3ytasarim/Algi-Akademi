--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activities (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    type character varying NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    entity_id character varying,
    entity_type character varying,
    metadata jsonb
);


ALTER TABLE public.activities OWNER TO neondb_owner;

--
-- Name: consultants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.consultants (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tc_no character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    title character varying DEFAULT 'Danışman'::character varying NOT NULL,
    email character varying,
    phone character varying,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.consultants OWNER TO neondb_owner;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.courses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    instructor_id character varying,
    price numeric(10,2),
    duration integer,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    thumbnail character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    category character varying DEFAULT 'Genel'::character varying NOT NULL,
    sections jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.courses OWNER TO neondb_owner;

--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.enrollments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    student_id character varying,
    course_id character varying,
    progress integer DEFAULT 0,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    enrolled_at timestamp without time zone DEFAULT now(),
    last_activity timestamp without time zone DEFAULT now()
);


ALTER TABLE public.enrollments OWNER TO neondb_owner;

--
-- Name: exam_results; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.exam_results (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    exam_id character varying,
    student_id character varying,
    score integer,
    completed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.exam_results OWNER TO neondb_owner;

--
-- Name: exams; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.exams (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    course_id character varying,
    title character varying NOT NULL,
    description text,
    max_score integer DEFAULT 100,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.exams OWNER TO neondb_owner;

--
-- Name: integrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.integrations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    type character varying NOT NULL,
    name character varying NOT NULL,
    config jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.integrations OWNER TO neondb_owner;

--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    email_enabled boolean DEFAULT true,
    sms_enabled boolean DEFAULT true,
    course_reminders boolean DEFAULT true,
    exam_notifications boolean DEFAULT true,
    system_updates boolean DEFAULT true,
    marketing_emails boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notification_settings OWNER TO neondb_owner;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_templates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    subject character varying,
    content text NOT NULL,
    variables jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notification_templates OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    type character varying NOT NULL,
    title character varying NOT NULL,
    message text NOT NULL,
    status character varying DEFAULT 'pending'::character varying,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sales (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    consultant_id character varying,
    student_id character varying,
    course_id character varying,
    sale_amount numeric(10,2) NOT NULL,
    collected_amount numeric(10,2) DEFAULT '0'::numeric,
    remaining_amount numeric(10,2) DEFAULT '0'::numeric,
    sale_date date DEFAULT now(),
    payment_status character varying DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sales OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'student'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    assigned_categories text[] DEFAULT ARRAY[]::text[],
    tc_kimlik_no character varying,
    password character varying,
    adi character varying,
    soyadi character varying,
    dogum_tarihi date,
    is_manual_student boolean DEFAULT false,
    bitis_tarihi date,
    cinsiyet character varying,
    meslek character varying,
    kayit_tarihi date,
    is_mernis_onayli boolean DEFAULT false,
    is_universite_onayli boolean DEFAULT false,
    is_edevlet_onayli boolean DEFAULT false,
    is_uluslararasi_sertifikasyon boolean DEFAULT false,
    selected_courses text[] DEFAULT ARRAY[]::text[],
    total_price numeric(10,2) DEFAULT '0'::numeric,
    discount_amount numeric(10,2) DEFAULT '0'::numeric,
    final_price numeric(10,2) DEFAULT '0'::numeric,
    telefon character varying,
    created_by character varying,
    last_login timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activities (id, user_id, type, description, created_at, entity_id, entity_type, metadata) FROM stdin;
5e953180-0169-48a3-adba-6abe022f69b9	45819635	student_created	Yeni öğrenci eklendi: Uğur Sağtekin	2025-08-05 18:36:52.044942	\N	\N	\N
9382c8f8-a88e-48ce-9818-d1e4b4d81b3f	admin	course_created	Yeni kurs oluşturuldu: Adli Sekreterlik	2025-08-06 00:04:09.806131	\N	\N	\N
244ba4f1-c492-4988-8844-0f2a255bd26e	admin	course_updated	Kurs güncellendi: Adli Sekreterlik	2025-08-06 00:06:46.381191	\N	\N	\N
baddeb66-c6a5-48ed-8bec-78c462817200	admin	course_updated	Kurs güncellendi: Adli Sekreterlik	2025-08-06 00:10:12.030647	\N	\N	\N
866bad1b-0ff8-47a0-8474-e52eb0d386f8	admin	course_created	Yeni kurs oluşturuldu: Aile Danışmanlığı	2025-08-06 00:14:19.544189	\N	\N	\N
11fe1610-039b-40f6-87d9-a2f82dd249ec	admin	course_created	Yeni kurs oluşturuldu: Arıcılık	2025-08-06 00:15:45.744013	\N	\N	\N
9bc4aa8d-4988-47c7-9c3a-e14c5fb167a8	admin	course_created	Yeni kurs oluşturuldu: Arıza Analiz Yöntemleri	2025-08-06 00:16:41.554178	\N	\N	\N
b6cf7800-b2e9-4efe-a335-77febd6dd51c	admin	course_created	Yeni kurs oluşturuldu: Aşçılık	2025-08-06 00:18:38.933451	\N	\N	\N
8235043e-a1b1-44ae-8e82-67053712a523	admin	course_deleted	Kurs silindi: Test Kurs	2025-08-07 11:57:01.314586	\N	\N	\N
\.


--
-- Data for Name: consultants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.consultants (id, tc_no, first_name, last_name, title, email, phone, user_id, created_at, updated_at) FROM stdin;
f8725002-a29a-439f-9a23-00a4fa4c6542	21478858647	SAFİYE	HANIM	Danışman	safiye@arkakademi.com	0555 123 4567	\N	2025-08-11 16:29:59.120708	2025-08-11 16:29:59.120708
010087fc-d9aa-4d6b-9fe3-533f72482198	12345678901	Test	Consultant	Danışman	test@example.com	1234567890	\N	2025-08-11 16:44:36.158605	2025-08-11 16:44:36.158605
8c0e5a2a-08a4-46f4-b839-3274ab4e9d28	52306142250	Rauf	Onur	Müdür	test@test.com	05050661535	\N	2025-08-11 16:45:18.134501	2025-08-11 16:45:18.134501
ff7ff9f1-497b-48ba-837d-4020b615aba6	54736114326	Yasemin	Çullu	Danışman	yasemin@algi.com	555-0001	b2ab7c9f-6fc5-4383-8894-a54c43f8c371	2025-08-11 21:25:55.87982	2025-08-11 21:25:55.87982
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.courses (id, title, description, instructor_id, price, duration, status, thumbnail, created_at, updated_at, category, sections) FROM stdin;
0b6fa053-1f58-4204-9c22-700a42913c03	Adli Sekreterlik	Adli Sekreterlik Kurs Dersleri	admin	5000.00	13	active	\N	2025-08-06 00:04:09.733002	2025-08-06 00:10:09.298	Genel	[{"name": "Uyap Nedir?", "pdfFile": {}}, {"name": "Sisteme Giriş", "pdfFile": {}}, {"name": "Hukuk Mahkemeleri", "pdfFile": {}}, {"name": "Dosya İşlemleri", "pdfFile": {}}, {"name": "Dosya Modülü", "pdfFile": {}}, {"name": "Dava Açılış Modülü", "pdfFile": {}}, {"name": "Tebligat Modülü", "pdfFile": {}}, {"name": "Duruşma İşlemleri", "pdfFile": {}}, {"name": "Bilirkişi Alt Modülü", "pdfFile": {}}, {"name": "Müzekkere Modülü", "pdfFile": {}}, {"name": "Talimat Modülü", "pdfFile": {}}, {"name": "Karar Modülü", "pdfFile": {}}, {"name": "Genel İşlemler", "pdfFile": {}}]
d9386f86-4055-4244-a420-a0d634094e95	Aile Danışmanlığı	Aile Danışmanlığı Dersleri	admin	5000.00	17	active	\N	2025-08-06 00:14:19.399921	2025-08-06 00:14:19.399921	Genel	[{"name": "Ders 1", "pdfFile": {}}, {"name": "Ders 2", "pdfFile": {}}, {"name": "Ders 3", "pdfFile": {}}, {"name": "Ders 4", "pdfFile": {}}, {"name": "Ders 5", "pdfFile": {}}, {"name": "Ders 6", "pdfFile": {}}, {"name": "Ders 7", "pdfFile": {}}, {"name": "Ders 8", "pdfFile": {}}, {"name": "Ders 9", "pdfFile": {}}, {"name": "Ders 10", "pdfFile": {}}, {"name": "Ders 11", "pdfFile": {}}, {"name": "Ders 12", "pdfFile": {}}, {"name": "Ders 13", "pdfFile": {}}, {"name": "Ders 14", "pdfFile": {}}, {"name": "Ders 15", "pdfFile": {}}, {"name": "Ders 16", "pdfFile": {}}, {"name": "Ders 17", "pdfFile": {}}]
0daabd79-7013-42a6-b2e9-cc4e55f33322	Arıcılık	Arıcılık Dersleri	admin	5000.00	2	active	\N	2025-08-06 00:15:45.602089	2025-08-06 00:15:45.602089	Genel	[{"name": "Modül 1", "pdfFile": {}}, {"name": "Modül 2", "pdfFile": {}}]
6def0eec-ff20-4989-8c79-9dc6ba1db925	Arıza Analiz Yöntemleri	Arıza Analiz Yöntemleri Dersleri	admin	5000.00	1	active	\N	2025-08-06 00:16:41.481315	2025-08-06 00:16:41.481315	Genel	[{"name": "Modül 1", "pdfFile": {}}]
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.enrollments (id, student_id, course_id, progress, status, enrolled_at, last_activity) FROM stdin;
\.


--
-- Data for Name: exam_results; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.exam_results (id, exam_id, student_id, score, completed_at) FROM stdin;
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.exams (id, course_id, title, description, max_score, created_at) FROM stdin;
\.


--
-- Data for Name: integrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.integrations (id, type, name, config, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_settings (id, user_id, email_enabled, sms_enabled, course_reminders, exam_notifications, system_updates, marketing_emails, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_templates (id, name, type, subject, content, variables, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, user_id, type, title, message, status, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sales (id, consultant_id, student_id, course_id, sale_amount, collected_amount, remaining_amount, sale_date, payment_status, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
VpMcYVsbzc7vUZZMEdaz_mKnU6C5ujk2	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-07T20:06:27.971Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-07 20:06:28
Oxh0Xkcrl1i7_xpt1iipftRF4Nj6Wyhk	{"auth": {"user": {"id": "admin", "role": "admin", "lastName": "User", "username": "admin", "firstName": "Admin"}, "isAuthenticated": true}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-07T20:06:39.989Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-07 20:06:40
u3PgS-_kLkM3QvyZfaGBH-reh7xyGTDN	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-07T20:16:07.250Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-07 20:16:08
2cK6BSn32bwDJRxYTG2eIlwIhHFYYprh	{"auth": {"user": {"id": "admin", "role": "admin", "lastName": "User", "username": "admin", "firstName": "Admin"}, "isAuthenticated": true}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-07T20:16:08.175Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-07 20:16:09
rf3Y0aDODpUTLil21edfWbMsSKHTxIye	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-07T20:16:59.776Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-07 20:17:00
e-ho-QD268l1rncC405RTgKcAZDf2vnU	{"auth": {"user": {"id": "admin", "role": "admin", "lastName": "User", "username": "admin", "firstName": "Admin"}, "isAuthenticated": true}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-07T20:17:02.297Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-07 20:17:03
VE1xmpVMibOCuRIf1mw2XAV0ltUrv-wr	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-07T20:17:02.403Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-07 20:17:03
0E7OL8J4u33eMxAhbrZQISJAkyuDjOIh	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-08T14:39:48.029Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-08 14:39:52
IpQYoHFgv5kannI_s-6W15SIZyoCVIsq	{"auth": {"user": null, "isAuthenticated": false}, "user": {"id": "b2ab7c9f-6fc5-4383-8894-a54c43f8c371", "role": "consultant", "email": "yasemin@algi.com", "lastName": "Çullu", "firstName": "Yasemin", "tcKimlikNo": "54736114326"}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T21:36:52.866Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 21:36:54
MfjFUm5OSWaIqmURwfyGuJRhmGkIcUf5	{"auth": {"user": null, "isAuthenticated": false}, "user": {"id": "b2ab7c9f-6fc5-4383-8894-a54c43f8c371", "role": "consultant", "email": "yasemin@algi.com", "lastName": "Çullu", "firstName": "Yasemin", "tcKimlikNo": "54736114326"}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T21:37:00.120Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 21:37:06
plc9C1ZBGrp2ZTTtLsk0iXOYNdelKZqY	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-08T14:39:49.671Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-08 14:39:54
IqMSkblQcq7wnqIiHbcXT9c-8_mErtVx	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-08T15:59:32.244Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-08 15:59:33
__GIi6i0vfN07zqXjfpeAVJIm72anhs4	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T16:23:21.217Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 16:23:22
3YXP_Bjub8xtJ91-kynWnsGFVj7rirvF	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T16:23:33.651Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 16:23:34
YHmEkFZVYPiQlG0IlQQ2dwVvjLLV3rb0	{"auth": {"user": {"id": "admin", "role": "admin", "lastName": "User", "username": "admin", "firstName": "Admin"}, "isAuthenticated": true}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T16:23:34.147Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 16:23:35
npylxjzR7aFeo5R0pJ889meYJlcDlTh3	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T19:21:26.306Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 19:21:27
29efeImZTCaXYFfUYluDpcsywPg8Y24c	{"auth": {"user": null, "isAuthenticated": false}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T21:25:55.914Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 21:25:56
kpI56LY8Zk1ofH9E5kuNLAPiSzdmfruX	{"auth": {"user": null, "isAuthenticated": false}, "user": {"id": "b2ab7c9f-6fc5-4383-8894-a54c43f8c371", "role": "consultant", "email": "yasemin@algi.com", "lastName": "Çullu", "firstName": "Yasemin", "tcKimlikNo": "54736114326"}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T21:25:56.620Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 21:25:57
Wb4T8WVTzauDQeG2Z57G1qZOR4gji_qW	{"auth": {"user": null, "isAuthenticated": false}, "user": {"id": "b2ab7c9f-6fc5-4383-8894-a54c43f8c371", "role": "consultant", "email": "yasemin@algi.com", "lastName": "Çullu", "firstName": "Yasemin", "tcKimlikNo": "54736114326"}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T21:37:26.269Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 21:37:27
SfiTsHRwnCHjK-hov46XMzaEJUdMybGT	{"auth": {"user": null, "isAuthenticated": false}, "user": {"id": "b2ab7c9f-6fc5-4383-8894-a54c43f8c371", "role": "consultant", "email": "yasemin@algi.com", "lastName": "Çullu", "firstName": "Yasemin", "tcKimlikNo": "54736114326"}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T21:37:43.250Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 21:37:44
m6NX6C9VnL9zadG8RN-_A3mxIP9L3jjV	{"auth": {"user": null, "isAuthenticated": false}, "user": {"id": "b2ab7c9f-6fc5-4383-8894-a54c43f8c371", "role": "consultant", "email": "yasemin@algi.com", "lastName": "Çullu", "firstName": "Yasemin", "tcKimlikNo": "54736114326"}, "cookie": {"path": "/", "secure": false, "expires": "2025-08-12T21:37:51.661Z", "httpOnly": true, "originalMaxAge": 86400000}}	2025-08-12 21:37:53
qU-nqqKvV8nRBIFRVuSCjAOf9CGBG7U7	{"cookie": {"path": "/", "secure": true, "expires": "2025-08-12T23:18:55.815Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "f855e285-997a-42e0-9527-af1f6590443a", "exp": 1754439535, "iat": 1754435935, "iss": "https://replit.com/oidc", "sub": "45819635", "email": "3ytasarim@gmail.com", "at_hash": "JgCMLNgpIpJYoKxLaCKrog", "username": "3ytasarim", "auth_time": 1754423412, "last_name": "Cullu", "first_name": "Rauf Onur"}, "expires_at": 1754439535, "access_token": "lxMkuT0VERw93_YqyCf8X0bJPjNezPN68l3W2oV3-mN", "refresh_token": "vL8vwzgQXgtL-tnAtktH1bojWe8NpP7U0QDcO_pp-QO"}}}	2025-08-12 23:32:23
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, created_at, updated_at, assigned_categories, tc_kimlik_no, password, adi, soyadi, dogum_tarihi, is_manual_student, bitis_tarihi, cinsiyet, meslek, kayit_tarihi, is_mernis_onayli, is_universite_onayli, is_edevlet_onayli, is_uluslararasi_sertifikasyon, selected_courses, total_price, discount_amount, final_price, telefon, created_by, last_login) FROM stdin;
b2ab7c9f-6fc5-4383-8894-a54c43f8c371	yasemin@algi.com	Yasemin	Çullu	\N	consultant	2025-08-11 21:25:55.804872	2025-08-11 21:25:55.804872	{}	54736114326	112233	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	f	{}	0.00	0.00	0.00	555-0001	\N	2025-08-12 12:32:00.940131
584ab19f-e85d-465e-b290-265b3d9acd60	test@test.com	Rauf Onur	Çullu	\N	student	2025-08-06 14:38:25.103289	2025-08-06 15:00:51.333	{Genel}	52306142250	11223344	Rauf Onur	Çullu	1984-05-28	t	2027-08-06	Erkek	Özel Sektör	2025-08-06	f	t	t	t	{a17172d0-9c2f-4c75-a803-df439448190b,6def0eec-ff20-4989-8c79-9dc6ba1db925,0daabd79-7013-42a6-b2e9-cc4e55f33322}	15000.00	5000.00	10000.00	0505 066 15 35	\N	2025-08-12 12:32:00.940131
85c8976f-1178-4bbd-80c0-36f2f73a2cf4	uifix@test.com	UPDATED Test User	API Working	\N	student	2025-08-07 13:14:37.656513	2025-08-07 13:14:37.656513	{}	12345678910	112233	UPDATED Test User	API Working	\N	t	\N	\N	\N	\N	f	f	f	f	{a17172d0-9c2f-4c75-a803-df439448190b}	5000.00	0.00	5000.00	0505 222 33 44	\N	2025-08-12 12:32:00.940131
cfd3d586-0ef5-47a4-b35f-2e39ae9e8a2f	ugur.sagtekin@test.com	Uğur	Sağtekin	\N	student	2025-08-11 13:47:28.657671	2025-08-11 13:47:28.657671	{}	22222222222	112233	Uğur	Sağtekin	\N	t	2027-08-11	Erkek	Test	2025-08-11	f	f	f	f	{}	0.00	0.00	0.00	0555 444 33 22	\N	2025-08-12 12:32:00.940131
45819635	3ytasarim@gmail.com	Rauf Onur	Cullu	\N	admin	2025-08-05 16:47:25.134838	2025-08-05 19:50:18.788	{"Web Development","Mobile Development"}	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	f	{}	0.00	0.00	0.00	\N	\N	2025-08-12 12:32:00.940131
admin	admin@algiacademy.com	Admin	User	\N	admin	2025-08-06 00:03:08.936147	2025-08-06 00:03:08.936147	{}	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	f	f	f	f	{}	0.00	0.00	0.00	\N	\N	2025-08-12 12:32:00.940131
60b74c12-8bc3-4179-b1b2-1e523918dc2b	osmannuri@hotmail.com	Osman	Nuri	\N	student	2025-08-12 19:25:39.977366	2025-08-12 19:25:39.977366	{Genel}	36484616086	123456	Osman	Nuri	\N	f	2027-08-06	\N	\N	\N	f	f	f	f	{}	0.00	0.00	0.00	0505 531 72 22	\N	2025-08-12 19:25:39.977366
45ae0272-a010-47c5-bac0-ef3abc90fd00	testpro@test.com	Test Production	User Pro	\N	student	2025-08-07 12:52:26.316062	2025-08-07 12:52:26.316062	{}	12345678902	112233	Test Production	User Pro	\N	t	\N	\N	\N	\N	f	f	f	f	{0b6fa053-1f58-4204-9c22-700a42913c03}	0.00	0.00	0.00	0505 999 88 77	\N	2025-08-12 12:32:00.940131
99909297-6c45-4de6-a057-fa55b6a544a9	final@test.com	Production Test	Final User	\N	student	2025-08-07 12:52:47.304456	2025-08-07 12:52:47.304456	{}	12345678903	112233	Production Test	Final User	\N	t	\N	\N	\N	\N	f	f	f	f	{}	0.00	0.00	0.00	0505 111 22 33	\N	2025-08-12 12:32:00.940131
40f005a6-531e-4cdb-9cf1-f51151633d72	final@darkmode.test	Final Test	Dark Mode	\N	student	2025-08-07 12:58:10.750648	2025-08-07 12:58:10.750648	{}	12345678904	112233	Final Test	Dark Mode	\N	t	\N	\N	\N	\N	f	f	f	f	{a17172d0-9c2f-4c75-a803-df439448190b}	0.00	0.00	0.00	0505 888 99 00	\N	2025-08-12 12:32:00.940131
da7be3f7-5ef3-492b-bf81-83198bef95d1	csstest@example.com	CSS Test	Override	\N	student	2025-08-07 13:02:11.366323	2025-08-07 13:02:11.366323	{}	12345678905	112233	CSS Test	Override	\N	t	\N	\N	\N	\N	f	f	f	f	{}	0.00	0.00	0.00	0505 777 88 99	\N	2025-08-12 12:32:00.940131
7a41f9a2-f9e6-460e-bb61-b962bce518ba	direct@test.com	Direct Test	No Fallback	\N	student	2025-08-07 13:07:01.530056	2025-08-07 13:07:01.530056	{}	12345678906	112233	Direct Test	No Fallback	\N	t	\N	\N	\N	\N	f	f	f	f	{a17172d0-9c2f-4c75-a803-df439448190b}	0.00	0.00	0.00	0505 123 45 67	\N	2025-08-12 12:32:00.940131
a222a905-58b6-4568-98bb-8e04a9ad1bb5	finalfix@test.com	Final Fix Test	Complete	\N	student	2025-08-07 13:07:36.308273	2025-08-07 13:07:36.308273	{}	12345678907	112233	Final Fix Test	Complete	\N	t	\N	\N	\N	\N	f	f	f	f	{d9386f86-4055-4244-a420-a0d634094e95}	0.00	0.00	0.00	0505 999 00 11	\N	2025-08-12 12:32:00.940131
6eeb562a-652a-4b69-b7c5-dfba4dcb44a9	cache@test.com	Cache Clear Test	Final	\N	student	2025-08-07 13:09:03.286534	2025-08-07 13:09:03.286534	{}	12345678908	112233	Cache Clear Test	Final	\N	t	\N	\N	\N	\N	f	f	f	f	{}	0.00	0.00	0.00	0505 000 11 22	\N	2025-08-12 12:32:00.940131
\.


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: consultants consultants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consultants
    ADD CONSTRAINT consultants_pkey PRIMARY KEY (id);


--
-- Name: consultants consultants_tc_no_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consultants
    ADD CONSTRAINT consultants_tc_no_unique UNIQUE (tc_no);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: exam_results exam_results_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT exam_results_pkey PRIMARY KEY (id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: integrations integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_name_unique UNIQUE (name);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: activities activities_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: consultants consultants_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consultants
    ADD CONSTRAINT consultants_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: courses courses_instructor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_instructor_id_users_id_fk FOREIGN KEY (instructor_id) REFERENCES public.users(id);


--
-- Name: enrollments enrollments_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: enrollments enrollments_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: exam_results exam_results_exam_id_exams_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT exam_results_exam_id_exams_id_fk FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_results exam_results_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT exam_results_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: exams exams_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: notification_settings notification_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sales sales_consultant_id_consultants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_consultant_id_consultants_id_fk FOREIGN KEY (consultant_id) REFERENCES public.consultants(id);


--
-- Name: sales sales_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: sales sales_student_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

