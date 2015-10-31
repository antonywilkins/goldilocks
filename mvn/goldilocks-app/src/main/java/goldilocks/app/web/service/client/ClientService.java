package goldilocks.app.web.service.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import goldilocks.domain.client.Client;
import goldilocks.repository.client.ClientRepository;
import goldilocks.util.domain.SortUtil;
import goldilocks.util.text.TextUtil;
import goldilocks.util.web.NoSuchEntityException;

@RestController
public class ClientService {

    private static final String[] DEFAULT_SORT_ORDER = new String[] { "lastName", "firstName" };

    @Autowired
    private ClientRepository clientRepository;

    @Transactional
    @RequestMapping(value = "/service/client/create", method = RequestMethod.POST)
    public Client create(@RequestBody Client client) {
        return update(client);
    }

    @RequestMapping("/service/client/search/findAll")
    public Page<Client> findAll(@RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);
        Page<Client> page = clientRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
        return page;
    }

    @RequestMapping("/service/client/search/findById")
    public Client findById(@RequestParam(value = "id", required = true) Long id) {
        Client entity = clientRepository.findOne(id);
        if (entity == null) {
            throw new NoSuchEntityException(id);
        }
        return entity;
    }

    @RequestMapping("/service/client/search/findByText")
    public Page<Client> findByText(@RequestParam(value = "text", required = false) String name,
            @RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);

        Page<Client> page;
        if (name == null) {
            page = clientRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
        } else {
            name = TextUtil.stripAccents(name);

            if (name.contains(" ")) {
                int delimIndex = name.lastIndexOf(' ');
                String firstName = name.substring(0, delimIndex);
                firstName = TextUtil.like(firstName);
                String lastName = name.substring(delimIndex + 1);
                lastName = TextUtil.like(lastName);

                page = clientRepository.findDistinctClientsByLastNameStrippedIgnoreCaseLikeAndFirstNameStrippedIgnoreCaseLike(lastName,
                        firstName, new PageRequest(pageNumber, pageSize, sort));
            } else {
                name = TextUtil.like(name);
                page = clientRepository.findDistinctClientsByLastNameStrippedIgnoreCaseLikeOrFirstNameStrippedIgnoreCaseLike(name, name,
                        new PageRequest(pageNumber, pageSize, sort));
            }
        }
        return page;
    }

    @Transactional
    @RequestMapping("/service/client/remove")
    public void remove(@RequestParam(value = "id") Long id) {
        clientRepository.delete(id);
    }

    @Transactional
    @RequestMapping(value = "/service/client/update", method = RequestMethod.POST)
    public Client update(@RequestBody Client client) {
        return clientRepository.save(client);
    }
}
