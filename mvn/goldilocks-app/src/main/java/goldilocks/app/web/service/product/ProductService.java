package goldilocks.app.web.service.product;

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

import goldilocks.domain.product.Product;
import goldilocks.repository.product.ProductRepository;
import goldilocks.util.domain.SortUtil;
import goldilocks.util.text.TextUtil;
import goldilocks.util.web.NoSuchEntityException;

@RestController
public class ProductService {
    private static final String[] DEFAULT_SORT_ORDER = new String[] { "name", "description" };

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    @RequestMapping(value = "/service/product/create", method = RequestMethod.POST)
    public Product create(@RequestBody Product product) {
        return update(product);
    }

    @RequestMapping("/service/product/search/findAll")
    public Page<Product> findAll(@RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);
        return productRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
    }

    @RequestMapping("/service/product/search/findById")
    public Product findById(@RequestParam(value = "id", required = true) Long id) {
        Product entity = productRepository.findOne(id);
        if (entity == null) {
            throw new NoSuchEntityException(id);
        }
        return entity;
    }

    @RequestMapping("/service/product/search/findByText")
    public Page<Product> findByText(@RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "sort", required = false) String sortField) {
        Sort sort = SortUtil.createSort(sortField, DEFAULT_SORT_ORDER);

        Page<Product> page;
        if (text == null) {
            page = productRepository.findAll(new PageRequest(pageNumber, pageSize, sort));
        } else {
            text = TextUtil.like(text);
            page = productRepository.findByNameIgnoreCaseLikeOrDescriptionIgnoreCaseLike(text, text,
                    new PageRequest(pageNumber, pageSize, sort));
        }
        return page;
    }

    @Transactional
    @RequestMapping("/service/product/remove")
    public void remove(@RequestParam(value = "id") Long id) {
        productRepository.delete(id);
    }

    @Transactional
    @RequestMapping(value = "/service/product/update", method = RequestMethod.POST)
    public Product update(@RequestBody Product product) {
        return productRepository.save(product);
    }

}
