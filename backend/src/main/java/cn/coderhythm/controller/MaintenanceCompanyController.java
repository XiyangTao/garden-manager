package cn.coderhythm.controller;

import cn.coderhythm.models.MaintenanceCompany;
import cn.coderhythm.payload.request.MaintenanceCompanyRequest;
import cn.coderhythm.payload.response.MessageResponse;
import cn.coderhythm.repository.MaintenanceCompanyRepository;
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
@RequestMapping("/maintenance-companies")
public class MaintenanceCompanyController {

    @Autowired
    MaintenanceCompanyRepository maintenanceCompanyRepository;

    // 获取所有养护单位
    @GetMapping("")
    public ResponseEntity<List<MaintenanceCompany>> getAllMaintenanceCompanies() {
        List<MaintenanceCompany> companies = maintenanceCompanyRepository.findAll();
        return ResponseEntity.ok(companies);
    }

    // 通过ID获取单个养护单位详情
    @GetMapping("/{id}")
    public ResponseEntity<?> getMaintenanceCompanyById(@PathVariable Long id) {
        Optional<MaintenanceCompany> company = maintenanceCompanyRepository.findById(id);
        if (company.isPresent()) {
            return ResponseEntity.ok(company.get());
        } else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("养护单位不存在！"));
        }
    }

    // 通过企业名称查询养护单位
    @GetMapping("/search")
    public ResponseEntity<List<MaintenanceCompany>> searchMaintenanceCompanies(@RequestParam(required = false) String companyName) {
        List<MaintenanceCompany> companies;
        
        if (companyName != null && !companyName.isEmpty()) {
            companies = maintenanceCompanyRepository.findByCompanyNameContaining(companyName);
        } else {
            companies = maintenanceCompanyRepository.findAll();
        }
        
        return ResponseEntity.ok(companies);
    }

    // 创建新养护单位
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createMaintenanceCompany(@Valid @RequestBody MaintenanceCompanyRequest companyRequest) {
        // 检查企业名称是否已存在
        if (maintenanceCompanyRepository.existsByCompanyName(companyRequest.getCompanyName())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("该企业名称已存在！"));
        }

        MaintenanceCompany company = new MaintenanceCompany(
                companyRequest.getCompanyName(),
                companyRequest.getCompanyType(),
                companyRequest.getLegalPerson(),
                companyRequest.getContactPerson(),
                companyRequest.getContactPhone(),
                companyRequest.getAddress()
        );

        MaintenanceCompany savedCompany = maintenanceCompanyRepository.save(company);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCompany);
    }

    // 更新养护单位
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMaintenanceCompany(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceCompanyRequest companyRequest) {

        Optional<MaintenanceCompany> companyData = maintenanceCompanyRepository.findById(id);
        if (companyData.isPresent()) {
            MaintenanceCompany company = companyData.get();
            
            // 检查更新的企业名称是否已存在（排除当前企业）
            if (!company.getCompanyName().equals(companyRequest.getCompanyName()) && 
                maintenanceCompanyRepository.existsByCompanyName(companyRequest.getCompanyName())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("该企业名称已存在！"));
            }
            
            company.setCompanyName(companyRequest.getCompanyName());
            company.setCompanyType(companyRequest.getCompanyType());
            company.setLegalPerson(companyRequest.getLegalPerson());
            company.setContactPerson(companyRequest.getContactPerson());
            company.setContactPhone(companyRequest.getContactPhone());
            company.setAddress(companyRequest.getAddress());

            return ResponseEntity.ok(maintenanceCompanyRepository.save(company));
        } else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("养护单位不存在！"));
        }
    }

    // 删除养护单位
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMaintenanceCompany(@PathVariable Long id) {
        try {
            maintenanceCompanyRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("养护单位删除成功！"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("删除养护单位失败！"));
        }
    }
} 