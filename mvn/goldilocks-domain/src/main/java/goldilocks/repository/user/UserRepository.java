package goldilocks.repository.user;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import goldilocks.domain.user.User;

public interface UserRepository extends JpaRepository<User, String>, UserRepositoryCustom {
    static final String TYPE = "User";
    static final String JOIN_FETCH = " LEFT join fetch t.roles ";
    static final String COUNT = "select count(distinct t) from " + TYPE + " t ";
    static final String SELECT_START = "select distinct(t) from " + TYPE + " t ";
    static final String SELECT = SELECT_START + JOIN_FETCH;

    @Override
    @Query(SELECT)
    List<User> findAll();

    @Override
    @Query(SELECT + "where t.id in :ids")
    List<User> findAll(@Param("ids") Iterable<String> ids);

    @Override
    @Query(value = SELECT, countQuery = COUNT)
    Page<User> findAll(Pageable pageable);

    @Override
    @Query(SELECT)
    List<User> findAll(Sort sort);

    @Query(value = "select t from User t LEFT join fetch t.roles where UPPER(t.id) like UPPER(:id) or UPPER(t.name) like UPPER(:name)",
            countQuery = "select count(t) from User t where UPPER(t.id) like UPPER(:id) or UPPER(t.name) like UPPER(:name)")
    Page<User> findByIdIgnoreCaseLikeOrNameIgnoreCaseLike(@Param("id") String id, @Param("name") String name, Pageable pageable);

    User findBySuperuserIsTrue();

    @Override
    @Query(SELECT + "where t.id = :id")
    User findOne(@Param("id") String id);
}