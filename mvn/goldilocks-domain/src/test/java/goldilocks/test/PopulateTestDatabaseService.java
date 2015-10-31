package goldilocks.test;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import goldilocks.domain.appconfig.ApplicationConfig;
import goldilocks.domain.appointment.ClientAppointment;
import goldilocks.domain.appointment.ServiceBooking;
import goldilocks.domain.client.Client;
import goldilocks.domain.client.Gender;
import goldilocks.domain.client.PhoneNumber;
import goldilocks.domain.client.PhoneNumberType;
import goldilocks.domain.openingHours.OpeningHoursRegularDayTimePeriods;
import goldilocks.domain.product.Product;
import goldilocks.domain.product.Service;
import goldilocks.domain.staff.ExpertiseLevel;
import goldilocks.domain.staff.Staff;
import goldilocks.domain.staff.StaffRegularDayTimePeriods;
import goldilocks.domain.user.Role;
import goldilocks.domain.user.User;
import goldilocks.repository.appconfig.ApplicationConfigRepository;
import goldilocks.repository.appointment.ClientAppointmentRepository;
import goldilocks.repository.client.ClientRepository;
import goldilocks.repository.openingHours.OpeningHoursDayTimePeriodsRepository;
import goldilocks.repository.product.ProductRepository;
import goldilocks.repository.product.ServiceRepository;
import goldilocks.repository.role.RoleRepository;
import goldilocks.repository.staff.StaffRegularDayTimePeriodsRepository;
import goldilocks.repository.staff.StaffRepository;
import goldilocks.repository.user.UserRepository;
import goldilocks.util.domain.DateUtil;
import goldilocks.util.domain.LocalTimePeriod;

@org.springframework.stereotype.Service
public class PopulateTestDatabaseService {

    static Instant daysInFutureWithTime(long daysInFuture, int hours, int minutes) {
        Instant date = DateUtil.withTime(LocalDate.now().plusDays(daysInFuture), hours, minutes);
        return date;
    }

    static Instant today(int hours, int minutes) {
        return daysInFutureWithTime(0L, hours, minutes);
    }

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private StaffRegularDayTimePeriodsRepository regularDaysRepository;

    @Autowired
    private OpeningHoursDayTimePeriodsRepository openingHoursRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ClientAppointmentRepository appointmentRepository;

    @Autowired
    private ApplicationConfigRepository configRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public PopulateTestDatabaseService() {
    }

    private void createAppointments(long plusDays, List<Staff> staff, List<Client> clients, List<Product> products,
            List<Service> services) {
        ClientAppointment app = new ClientAppointment();
        ServiceBooking serviceBooking = new ServiceBooking();
        serviceBooking.setService(services.get(0));
        app.addService(serviceBooking, 0);
        app.setClient(clients.get(0));
        serviceBooking.setStaff(staff.get(0));
        app.setStart(daysInFutureWithTime(plusDays, 11, 00));
        serviceBooking.setDuration(Duration.ofMinutes(30));
        appointmentRepository.save(app);

        app = new ClientAppointment();
        serviceBooking = new ServiceBooking();
        serviceBooking.setService(services.get(1));
        app.addService(serviceBooking, 0);
        app.setClient(clients.get(1));
        serviceBooking.setStaff(staff.get(0));
        app.setStart(daysInFutureWithTime(plusDays, 12, 00));
        serviceBooking.setDuration(Duration.ofMinutes(30));
        appointmentRepository.save(app);

        app = new ClientAppointment();
        serviceBooking = new ServiceBooking();
        serviceBooking.setService(services.get(2));
        app.addService(serviceBooking, 0);
        app.setClient(clients.get(2));
        serviceBooking.setStaff(staff.get(0));
        app.setStart(daysInFutureWithTime(plusDays, 12, 30));
        serviceBooking.setDuration(Duration.ofMinutes(60));
        appointmentRepository.save(app);

        app = new ClientAppointment();
        serviceBooking = new ServiceBooking();
        serviceBooking.setService(services.get(0));
        app.addService(serviceBooking, 0);
        app.setClient(clients.get(3));
        serviceBooking.setStaff(staff.get(0));
        app.setStart(daysInFutureWithTime(plusDays, 14, 15));
        serviceBooking.setDuration(Duration.ofMinutes(75));
        appointmentRepository.save(app);

        app = new ClientAppointment();
        serviceBooking = new ServiceBooking();
        serviceBooking.setService(services.get(0));
        app.addService(serviceBooking, 0);
        app.setClient(clients.get(21));
        serviceBooking.setStaff(staff.get(1));
        app.setStart(daysInFutureWithTime(plusDays, 9, 00));
        serviceBooking.setDuration(Duration.ofMinutes(90));
        appointmentRepository.save(app);

        app = new ClientAppointment();
        serviceBooking = new ServiceBooking();
        app.addService(serviceBooking, 0);
        serviceBooking.setService(services.get(0));
        app.setClient(clients.get(22));
        serviceBooking.setStaff(staff.get(1));
        app.setStart(daysInFutureWithTime(plusDays, 13, 00));
        serviceBooking.setDuration(Duration.ofMinutes(90));
        appointmentRepository.save(app);
    }

    private List<Client> createClients() {

        List<Client> clients = new ArrayList<>();
        // save a couple of clients
        Random rnd = new Random();

        for (String firstName : new String[] { "Bob", "Alice", "Ford", "Aria", "Stephanie", "Alison", "Wendy", "Katherine", "Kathrin",
                "Katerina", "Sharon", "Christina", "Matthew", "Antony", "Anthony", "Jimmy", "Johnny", "Jose", "Alas", "Walter", "John",
                "Anna", "Simon", "Toby", "Homer", "Celia", "Angela", "Paul", "Jacob", "Billy", "Bobby", "Ady", "Andy", "Sangeev", "Tom",
                "Quentin", "Jackie", "Timmy", "Terance", "Tracy", "Tracey", "Dick", "Mad", "Max", "Mr", "Fred", "Chris", "Ken", "Barbie",
                "Dany", "Igor", "Olga", "Enthwhistle", "Harry", "Henrik", "Gwynth", "Betty", "Angelina", "Lee", "Big", "Biff", "Francis",
                "Joffrey", "Sansa", "Podrick", "Hodor", "Lech" }) {
            for (String lastName : new String[] { "Smith", "Jones", "McKay", "Hendrix", "Reed", "Sack", "Carerras", "Tracy", "Max", "T",
                    "Baskhar", "Williams", "Tarantino", "Ballerina", "Fletcher", "Watson", "Dawkins", "Hawkins", "Bean", "Ben", "Daddy",
                    "Underwood", "Urqhart", "Nixon", "Cleese", "Oddie", "Baldrick", "Lanister", "Crips", "Crisp", "Morrison", "Parkingson",
                    "Brown", "Lopez", "Hyphen-Van-Compound-Barrelled-The-Third", "White", "Stark", "Ford", "Prefect", "Johanson",
                    "Parkington-Smythe", "Simpson", "Wałęsa" }) {

                Client c = new Client(firstName, lastName);

                c.setAddress(firstName + "33 Some street\nTown\nCounty");
                c.setPhoneNumbers(Arrays.asList(new PhoneNumber(PhoneNumberType.MOBILE, "123 123 123")));
                c.setEmail(c.getFirstNameStripped() + "." + c.getLastNameStripped() + "@email.com");

                // 01-01-1940 plus up to 75 years
                long ms = -946771200000L + (Math.abs(rnd.nextLong()) % (75L * 365 * 24 * 60 * 60 * 1000));
                c.setDateOfBirth(Instant.ofEpochMilli(ms).atZone(ZoneId.systemDefault()).toLocalDate());

                if (c.getDateOfBirth().getMonth().equals(Month.JANUARY)) {
                    c.setGender(Gender.MALE);
                    c.setAddress(null);
                    c.setPhoneNumbers(null);
                }

                c = clientRepository.save(c);
                clients.add(c);
            }
        }
        return clients;
    }

    private ApplicationConfig createGlobalConfig() {
        ApplicationConfig config = configRepository.findByUserIsNull();
        config.set("systemInfo.name", "Hairology");
        configRepository.save(config);

        return config;
    }

    private OpeningHoursRegularDayTimePeriods createLongRegularDay(DayOfWeek dayOfWeek) {
        return createRegularOpeningHours(dayOfWeek, new LocalTimePeriod(LocalTime.of(9, 00), LocalTime.of(20, 00)));
    }

    private OpeningHoursRegularDayTimePeriods createNormalRegularDay(DayOfWeek dayOfWeek) {
        return createRegularOpeningHours(dayOfWeek, new LocalTimePeriod(LocalTime.of(9, 00), LocalTime.of(12, 00)),
                new LocalTimePeriod(LocalTime.of(13, 00), LocalTime.of(18, 00)));
    }

    private StaffRegularDayTimePeriods createNormalRegularDay(Staff staff, DayOfWeek dayOfWeek) {
        return createRegularDay(staff, dayOfWeek, new LocalTimePeriod(LocalTime.of(9, 00), LocalTime.of(12, 00)),
                new LocalTimePeriod(LocalTime.of(13, 00), LocalTime.of(18, 00)));
    }

    private List<StaffRegularDayTimePeriods> createNormalRegularWeek(Staff staff) {
        List<StaffRegularDayTimePeriods> regularDays = new ArrayList<>();
        regularDays.add(createNormalRegularDay(staff, DayOfWeek.MONDAY));
        regularDays.add(createNormalRegularDay(staff, DayOfWeek.TUESDAY));
        regularDays.add(createNormalRegularDay(staff, DayOfWeek.WEDNESDAY));
        regularDays.add(createNormalRegularDay(staff, DayOfWeek.THURSDAY));
        regularDays.add(createNormalRegularDay(staff, DayOfWeek.FRIDAY));
        regularDays.add(createNormalRegularDay(staff, DayOfWeek.SATURDAY));
        return regularDays;
    }

    private void createOpeningHours() {
        List<OpeningHoursRegularDayTimePeriods> openingHoursWeek = createOpeningHoursWeek();
        openingHoursRepository.save(openingHoursWeek);
    }

    private List<OpeningHoursRegularDayTimePeriods> createOpeningHoursWeek() {
        List<OpeningHoursRegularDayTimePeriods> regularDays = new ArrayList<>();
        regularDays.add(createNormalRegularDay(DayOfWeek.MONDAY));
        regularDays.add(createNormalRegularDay(DayOfWeek.TUESDAY));
        regularDays.add(createLongRegularDay(DayOfWeek.WEDNESDAY));
        regularDays.add(createLongRegularDay(DayOfWeek.THURSDAY));
        regularDays.add(createNormalRegularDay(DayOfWeek.FRIDAY));
        regularDays.add(createNormalRegularDay(DayOfWeek.SATURDAY));
        return regularDays;
    }

    private List<Product> createProducts() {
        List<Product> productList = new ArrayList<>();

        Product product = new Product();
        product.setName("shampoo");
        product.setDescription("Shampoo");
        product.setPrice(499);
        product.setStock(13);
        product = productRepository.save(product);
        productList.add(product);

        product = new Product();
        product.setName("coloring");
        product.setDescription("colouring solution");
        product.setPrice(599);
        product.setStock(12);
        product = productRepository.save(product);
        productList.add(product);

        product = new Product();
        product.setName("blue");
        product.setDescription("blue rinse");
        product.setPrice(349);
        product.setStock(22);
        product = productRepository.save(product);
        productList.add(product);

        return productList;
    }

    private StaffRegularDayTimePeriods createRegularDay(Staff staff, DayOfWeek dayOfWeek, LocalTimePeriod... times) {
        StaffRegularDayTimePeriods periods = new StaffRegularDayTimePeriods();
        periods.setStaff(staff);
        periods.setDayOfWeek(dayOfWeek);
        periods.setPeriods(Arrays.asList(times));
        return periods;
    }

    private OpeningHoursRegularDayTimePeriods createRegularOpeningHours(DayOfWeek dayOfWeek, LocalTimePeriod... times) {
        OpeningHoursRegularDayTimePeriods periods = new OpeningHoursRegularDayTimePeriods(dayOfWeek);
        periods.setPeriods(Arrays.asList(times));
        return periods;
    }

    private List<Service> createServices() {
        List<Service> serviceList = new ArrayList<>();

        Service service = new Service();
        service.setName("CBD");
        service.setDescription("Cut and blow dry");
        service.setPrice(ExpertiseLevel.JUNIOR, 500);
        service.setPrice(ExpertiseLevel.SENIOR, 600);
        service.setPrice(ExpertiseLevel.MANAGER, 700);
        service = serviceRepository.save(service);
        serviceList.add(service);

        service = new Service();
        service.setName("CBJ");
        service.setDescription("Cut and blow job");
        service.setPrice(ExpertiseLevel.SENIOR, 2000);
        service.setPrice(ExpertiseLevel.MANAGER, 2500);
        service = serviceRepository.save(service);
        serviceList.add(service);

        service = new Service();
        service.setName("Dye");
        service.setDescription("Dye");
        service.setPrice(ExpertiseLevel.JUNIOR, 700);
        service.setPrice(ExpertiseLevel.SENIOR, 800);
        service.setPrice(ExpertiseLevel.MANAGER, 950);
        service = serviceRepository.save(service);
        serviceList.add(service);

        return serviceList;
    }

    private List<Staff> createStaff() {
        List<Staff> staffList = new ArrayList<>();

        Staff staff = new Staff("Anna Georgiou");
        staff.setExpertiseLevel(ExpertiseLevel.MANAGER);
        staff = staffRepository.save(staff);
        staffList.add(staff);
        List<StaffRegularDayTimePeriods> regularDays = createNormalRegularWeek(staff);
        regularDaysRepository.save(regularDays);

        staff = new Staff("Stephanie Says");
        staff.setExpertiseLevel(ExpertiseLevel.SENIOR);
        staff = staffRepository.save(staff);
        staffList.add(staff);
        regularDays = createNormalRegularWeek(staff);
        regularDaysRepository.save(regularDays);

        staff = new Staff("Sally Cinnamon");
        staff.setExpertiseLevel(ExpertiseLevel.JUNIOR);
        staff = staffRepository.save(staff);
        staffList.add(staff);
        regularDays = createNormalRegularWeek(staff);
        regularDaysRepository.save(regularDays);

        staff = new Staff("Nico");
        staff.setExpertiseLevel(ExpertiseLevel.JUNIOR);
        staff = staffRepository.save(staff);
        staffList.add(staff);
        regularDays = createNormalRegularWeek(staff);
        regularDaysRepository.save(regularDays);

        return staffList;
    }

    private void createUsers() {
        Role roleUserAdmin = roleRepository.findOne("ROLE_USER_ADMIN");
        Role roleUser = roleRepository.findOne("ROLE_USER");
        Role roleProductAdmin = roleRepository.findOne("ROLE_PRODUCT_ADMIN");
        Role roleServiceAdmin = roleRepository.findOne("ROLE_SERVICE_ADMIN");
        Role roleStaffAdmin = roleRepository.findOne("ROLE_STAFF_ADMIN");

        Set<Role> superUserRoles = new HashSet<>(
                Arrays.asList(roleUserAdmin, roleProductAdmin, roleServiceAdmin, roleStaffAdmin, roleUser));

        // admin user
        User adminUser = userRepository.findBySuperuserIsTrue();
        adminUser.setPassword(passwordEncoder.encode("p"));
        adminUser = userRepository.save(adminUser);
        ApplicationConfig adminConfig = new ApplicationConfig(adminUser);
        adminConfig.set("pagination.pageSize", 20);
        configRepository.save(adminConfig);

        // manager
        User managerUser = new User("manager", passwordEncoder.encode("p"), "Manager", false);
        managerUser.setRoles(superUserRoles);
        userRepository.save(managerUser);

        // senior
        User seniorUser = new User("senior", passwordEncoder.encode("p"), "Senior", false);
        seniorUser.setRoles(new HashSet<>(Arrays.asList(roleProductAdmin, roleServiceAdmin, roleUser)));
        userRepository.save(seniorUser);

        // reception
        User receptionUser = new User("reception", passwordEncoder.encode("p"), "Reception", false);
        receptionUser.setRoles(new HashSet<>(Arrays.asList(roleUser)));
        userRepository.save(receptionUser);

        receptionUser = new User("reception2", passwordEncoder.encode("p"), "Reception", true);
        receptionUser.setRoles(new HashSet<>(Arrays.asList(roleUser)));
        userRepository.save(receptionUser);
    }

    public void populate() {

        createGlobalConfig();
        createUsers();

        createOpeningHours();
        List<Product> products = createProducts();
        List<Service> services = createServices();

        List<Staff> staff = createStaff();
        List<Client> clients = createClients();

        createAppointments(-2L, staff, clients, products, services);
        createAppointments(-1L, staff, clients, products, services);
        createAppointments(0L, staff, clients, products, services);
        createAppointments(1L, staff, clients, products, services);
        createAppointments(2L, staff, clients, products, services);
    }

}
