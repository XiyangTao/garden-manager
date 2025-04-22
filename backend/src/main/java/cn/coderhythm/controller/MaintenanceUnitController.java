package cn.coderhythm.controller;

import cn.coderhythm.models.MaintenanceUnit;
import cn.coderhythm.payload.request.MaintenanceUnitRequest;
import cn.coderhythm.payload.response.MessageResponse;
import cn.coderhythm.repository.MaintenanceUnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/maintenance-units")
public class MaintenanceUnitController {

    @Autowired
    MaintenanceUnitRepository maintenanceUnitRepository;

    // 获取所有管养单元
    @GetMapping
    public ResponseEntity<List<MaintenanceUnit>> getAllMaintenanceUnits() {
        List<MaintenanceUnit> units = maintenanceUnitRepository.findAll();
        return ResponseEntity.ok(units);
    }

    // 获取单个管养单元详情
    @GetMapping("/{id}")
    public ResponseEntity<?> getMaintenanceUnitById(@PathVariable Long id) {
        Optional<MaintenanceUnit> unit = maintenanceUnitRepository.findById(id);
        if (unit.isPresent()) {
            return ResponseEntity.ok(unit.get());
        } else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("管养单元不存在！"));
        }
    }

    // 创建新管养单元
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createMaintenanceUnit(@Valid @RequestBody MaintenanceUnitRequest unitRequest) {
        MaintenanceUnit unit = new MaintenanceUnit(
                unitRequest.getUnitName(),
                unitRequest.getMaintenanceLevel(),
                unitRequest.getTreeTypes(),
                unitRequest.getTreeCount(),
                unitRequest.getGreenArea(),
                unitRequest.getPatchCount()
        );

        MaintenanceUnit savedUnit = maintenanceUnitRepository.save(unit);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUnit);
    }

    // 更新管养单元
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMaintenanceUnit(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceUnitRequest unitRequest) {

        Optional<MaintenanceUnit> unitData = maintenanceUnitRepository.findById(id);
        if (unitData.isPresent()) {
            MaintenanceUnit unit = unitData.get();
            unit.setUnitName(unitRequest.getUnitName());
            unit.setMaintenanceLevel(unitRequest.getMaintenanceLevel());
            unit.setTreeTypes(unitRequest.getTreeTypes());
            unit.setTreeCount(unitRequest.getTreeCount());
            unit.setGreenArea(unitRequest.getGreenArea());
            unit.setPatchCount(unitRequest.getPatchCount());

            return ResponseEntity.ok(maintenanceUnitRepository.save(unit));
        } else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("管养单元不存在！"));
        }
    }

    // 删除管养单元
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMaintenanceUnit(@PathVariable Long id) {
        try {
            maintenanceUnitRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("管养单元删除成功！"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("删除管养单元失败！"));
        }
    }
} 