package cn.coderhythm.repository;

import cn.coderhythm.models.MaintenanceCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceCompanyRepository extends JpaRepository<MaintenanceCompany, Long> {
    // 通过企业名称查找养护单位
    Optional<MaintenanceCompany> findByCompanyName(String companyName);
    
    // 通过企业类别查找养护单位
    List<MaintenanceCompany> findByCompanyType(String companyType);
    
    // 通过企业名称模糊查询
    List<MaintenanceCompany> findByCompanyNameContaining(String companyName);
    
    // 检查企业名称是否存在
    boolean existsByCompanyName(String companyName);
} 