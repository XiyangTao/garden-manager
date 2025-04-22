package cn.coderhythm.repository;

import cn.coderhythm.models.MaintenanceUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceUnitRepository extends JpaRepository<MaintenanceUnit, Long> {
    // 通过名称查找管养单元
    Optional<MaintenanceUnit> findByUnitName(String unitName);
    
    // 通过管养等级查找管养单元
    List<MaintenanceUnit> findByMaintenanceLevel(String maintenanceLevel);
    
    // 检查管养单元名称是否存在
    boolean existsByUnitName(String unitName);
} 