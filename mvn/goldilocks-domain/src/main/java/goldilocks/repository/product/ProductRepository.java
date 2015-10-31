package goldilocks.repository.product;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.product.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    static final String TYPE = "Product";
    static final String JOIN_FETCH = "";
    static final String COUNT = "select count(t) from " + TYPE + " t ";
    static final String SELECT_START = "select t from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    @Override
    @Query(SELECT)
    List<Product> findAll();

    @Override
    @Query(SELECT + "where t.id in :ids")
    List<Product> findAll(@Param("ids") Iterable<Long> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<Product> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<Product> findAll(Sort sort);

    @Query(value = SELECT + " where UPPER(t.name) like UPPER(:name) or UPPER(t.description) like UPPER(:description)",
            countQuery = COUNT + " where UPPER(t.name) like UPPER(:name) or UPPER(t.description) like UPPER(:description)")
    Page<Product> findByNameIgnoreCaseLikeOrDescriptionIgnoreCaseLike(@Param("name") String name, @Param("description") String description,
            Pageable pageable);

    @Override
    @Query(SELECT + "where t.id = :id")
    Product findOne(@Param("id") Long id);
}