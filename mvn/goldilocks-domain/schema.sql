
    alter table app_user_roles 
        drop constraint if exists FK_APP_USER_ROLES_ROLENAME;

    alter table app_user_roles 
        drop constraint if exists FK_APP_USER_ROLES;

    alter table application_config 
        drop constraint if exists FK_APPLICATION_CONFIG_USER;

    alter table client_appointment 
        drop constraint if exists FK_CLIENT_APPOINTMENT_CLIENT;

    alter table client_appointment_products 
        drop constraint if exists FK_CLIENT_APPOINTMENT_PRODUCTS_PRODUCT;

    alter table client_appointment_products 
        drop constraint if exists FK_CLIENT_APPOINTMENT_PRODUCTS;

    alter table client_appointment_services 
        drop constraint if exists FK_CLIENT_APPOINTMENT_SERVICES_SERVICE;

    alter table client_appointment_services 
        drop constraint if exists FK_CLIENT_APPOINTMENT_SERVICES;

    alter table client_phone_numbers 
        drop constraint if exists FK_CLIENT_PHONE_NUMBERS_CLIENT;

    alter table service_booking 
        drop constraint if exists FK_SERVICE_BOOKING_SERVICE;

    alter table service_booking 
        drop constraint if exists FK_SERVICE_BOOKING_STAFF;

    alter table service_prices 
        drop constraint if exists FK_SERVICE_PRICES;

    alter table staff_holiday 
        drop constraint if exists FK_STAFF_HOLIDAY_STAFF;

    alter table staff_override_time_periods 
        drop constraint if exists FK_STAFF_OVERRIDE_TIME_PERIODS_STAFF;

    alter table staff_override_time_periods_period 
        drop constraint if exists FK_STAFF_OVERRIDE_TIME_PERIODS_PERIOD;

    alter table staff_regular_day_time_periods 
        drop constraint if exists FK_STAFF_REGULAR_DAY_TIME_PERIODS_STAFF;

    alter table staff_regular_day_time_periods_periods 
        drop constraint if exists FK_STAFF_REGULAR_DAY_TIME_PERIODS_PERIODS;

    drop table app_user cascade;

    drop table app_user_roles cascade;

    drop table application_config cascade;

    drop table client cascade;

    drop table client_appointment cascade;

    drop table client_appointment_products cascade;

    drop table client_appointment_services cascade;

    drop table client_phone_numbers cascade;

    drop table product cascade;

    drop table role cascade;

    drop table service cascade;

    drop table service_booking cascade;

    drop table service_prices cascade;

    drop table staff cascade;

    drop table staff_holiday cascade;

    drop table staff_override_time_periods cascade;

    drop table staff_override_time_periods_period cascade;

    drop table staff_regular_day_time_periods cascade;

    drop table staff_regular_day_time_periods_periods cascade;

    drop sequence hibernate_sequence;

    create table app_user (
        id varchar(255) not null,
        enabled boolean not null,
        name varchar(255) not null,
        password varchar(255) not null,
        reset_password boolean not null,
        superuser boolean not null,
        version int8,
        primary key (id)
    );

    create table app_user_roles (
        app_user_id varchar(255) not null,
        roles_id varchar(255) not null,
        primary key (app_user_id, roles_id)
    );

    create table application_config (
        id int8 not null,
        property_text text not null,
        version int8,
        user_id varchar(255),
        primary key (id)
    );

    create table client (
        id int8 not null,
        address varchar(1000),
        comments varchar(1000),
        date_of_birth bytea not null,
        email varchar(100),
        first_name varchar(255) not null,
        first_name_stripped varchar(255) not null,
        gender int4 not null,
        last_name varchar(255) not null,
        last_name_stripped varchar(255) not null,
        version int8,
        primary key (id)
    );

    create table client_appointment (
        id int8 not null,
        arrival_time bytea,
        cancel_reason int4,
        cancelled_time bytea,
        start bytea not null,
        version int8,
        client_id int8 not null,
        primary key (id)
    );

    create table client_appointment_products (
        client_appointment_id int8 not null,
        products_id int8 not null
    );

    create table client_appointment_services (
        client_appointment_id int8 not null,
        services_id int8 not null
    );

    create table client_phone_numbers (
        client_id int8 not null,
        phone_number varchar(255) not null,
        type int4 not null
    );

    create table product (
        id int8 not null,
        description varchar(255) not null,
        name varchar(255) not null,
        price int4 not null,
        stock int4 not null,
        version int8,
        primary key (id)
    );

    create table role (
        id varchar(255) not null,
        description varchar(255) not null,
        version int8,
        primary key (id)
    );

    create table service (
        id int8 not null,
        description varchar(255) not null,
        name varchar(255) not null,
        version int8,
        primary key (id)
    );

    create table service_booking (
        id int8 not null,
        duration bytea not null,
        version int8,
        service_id int8,
        staff_id int8,
        primary key (id)
    );

    create table service_prices (
        service_id int8 not null,
        price int4,
        expertise_level int4 not null,
        primary key (service_id, expertise_level)
    );

    create table staff (
        id int8 not null,
        expertise_level int4 not null,
        name varchar(255) not null,
        version int8,
        primary key (id)
    );

    create table staff_holiday (
        id int8 not null,
        day bytea not null,
        version int8,
        staff_id int8 not null,
        primary key (id)
    );

    create table staff_override_time_periods (
        id int8 not null,
        day bytea not null,
        version int8,
        staff_id int8 not null,
        primary key (id)
    );

    create table staff_override_time_periods_period (
        staff_override_time_periods_id int8 not null,
        end bytea not null,
        start bytea not null
    );

    create table staff_regular_day_time_periods (
        id int8 not null,
        day_of_week varchar(255) not null,
        version int8,
        staff_id int8 not null,
        primary key (id)
    );

    create table staff_regular_day_time_periods_periods (
        staff_regular_day_time_periods_id int8 not null,
        end bytea not null,
        start bytea not null
    );

    create index IDX_USER_NAMES on app_user (name, id);

    alter table application_config 
        add constraint UK_APPLICATION_CONFIG_USER  unique (user_id);

    create index IDX_CLIENT_NAMES on client (first_name_stripped, last_name_stripped);

    create index IDX_CLIENT_APPOINTMENT_START on client_appointment (start);

    alter table client_appointment_products 
        add constraint UK_nf5ubwyup34gcj2rqwwdnv1b3  unique (products_id);

    alter table client_appointment_services 
        add constraint UK_relopoaxiwc9euy4wjekgor9t  unique (services_id);

    create index IDX_PRODUCT_NAMES on product (name, description);

    create index IDX_SERVICE_NAMES on service (name, description);

    create index IDX_STAFF_NAME on staff (name);

    alter table staff_holiday 
        add constraint UK_STAFF_HOLIDAY_STAFF_DAY  unique (staff_id, day);

    create index IDX_STAFF_HOLIDAY_DAY on staff_holiday (staff_id, day);

    alter table staff_override_time_periods 
        add constraint UK_STAFF_OVERRIDE_TIME_PERIODS  unique (staff_id, day);

    create index IDX_STAFF_OVERRIDE_TIME_STAFF_PERIODS_DAY on staff_override_time_periods (staff_id, day);

    alter table staff_regular_day_time_periods 
        add constraint UK_STAFF_WORKING_WEEK_STAFF_DAY  unique (staff_id, day_of_week);

    create index IDX_STAFF_WORKING_WEEK_STAFF_DAY_OF_WEEK on staff_regular_day_time_periods (staff_id, day_of_week);

    alter table app_user_roles 
        add constraint FK_APP_USER_ROLES_ROLENAME 
        foreign key (roles_id) 
        references role;

    alter table app_user_roles 
        add constraint FK_APP_USER_ROLES 
        foreign key (app_user_id) 
        references app_user;

    alter table application_config 
        add constraint FK_APPLICATION_CONFIG_USER 
        foreign key (user_id) 
        references app_user;

    alter table client_appointment 
        add constraint FK_CLIENT_APPOINTMENT_CLIENT 
        foreign key (client_id) 
        references client;

    alter table client_appointment_products 
        add constraint FK_CLIENT_APPOINTMENT_PRODUCTS_PRODUCT 
        foreign key (products_id) 
        references product;

    alter table client_appointment_products 
        add constraint FK_CLIENT_APPOINTMENT_PRODUCTS 
        foreign key (client_appointment_id) 
        references client_appointment;

    alter table client_appointment_services 
        add constraint FK_CLIENT_APPOINTMENT_SERVICES_SERVICE 
        foreign key (services_id) 
        references service_booking;

    alter table client_appointment_services 
        add constraint FK_CLIENT_APPOINTMENT_SERVICES 
        foreign key (client_appointment_id) 
        references client_appointment;

    alter table client_phone_numbers 
        add constraint FK_CLIENT_PHONE_NUMBERS_CLIENT 
        foreign key (client_id) 
        references client;

    alter table service_booking 
        add constraint FK_SERVICE_BOOKING_SERVICE 
        foreign key (service_id) 
        references service;

    alter table service_booking 
        add constraint FK_SERVICE_BOOKING_STAFF 
        foreign key (staff_id) 
        references staff;

    alter table service_prices 
        add constraint FK_SERVICE_PRICES 
        foreign key (service_id) 
        references service;

    alter table staff_holiday 
        add constraint FK_STAFF_HOLIDAY_STAFF 
        foreign key (staff_id) 
        references staff;

    alter table staff_override_time_periods 
        add constraint FK_STAFF_OVERRIDE_TIME_PERIODS_STAFF 
        foreign key (staff_id) 
        references staff;

    alter table staff_override_time_periods_period 
        add constraint FK_STAFF_OVERRIDE_TIME_PERIODS_PERIOD 
        foreign key (staff_override_time_periods_id) 
        references staff_override_time_periods;

    alter table staff_regular_day_time_periods 
        add constraint FK_STAFF_REGULAR_DAY_TIME_PERIODS_STAFF 
        foreign key (staff_id) 
        references staff;

    alter table staff_regular_day_time_periods_periods 
        add constraint FK_STAFF_REGULAR_DAY_TIME_PERIODS_PERIODS 
        foreign key (staff_regular_day_time_periods_id) 
        references staff_regular_day_time_periods;

    create sequence hibernate_sequence;
