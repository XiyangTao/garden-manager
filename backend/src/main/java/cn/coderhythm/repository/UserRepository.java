package cn.coderhythm.repository;

import cn.coderhythm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    /**
     * 明确获取用户的完整信息，确保加载nickname和avatar字段
     */
    @Query("SELECT u FROM User u WHERE u.username = :username")
    Optional<User> findUserWithDetailsById(@Param("username") String username);
    
    Optional<User> findByEmail(String email);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
} 